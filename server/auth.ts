import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User as DBUser, registerSchema, loginSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends DBUser {}
  }
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-session-secret-here",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (!user.password) {
            return done(null, false, { message: "Please use Google Sign-In for this account" });
          }

          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL: "https://groupstudy-backend.onrender.com/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);

            if (user) {
              return done(null, user);
            }

            // Check if user exists with the same email
            user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");

            if (user) {
              // Link Google account to existing user
              const updatedUser = await storage.upsertUser({
                ...user,
                googleId: profile.id,
                authProvider: "google",
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
              });
              return done(null, updatedUser);
            }

            // Create new user
            const newUser = await storage.createUser({
              email: profile.emails?.[0]?.value || "",
              password: null,
              googleId: profile.id,
              authProvider: "google",
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              linkedInId: null,
              githubId: null,
              role: "student",
              studyGoals: null,
              preferredSubjects: null,
              learningPace: null,
              availability: null,
              studyStreak: 0,
              totalPoints: 0,
              globalRank: null,
              totalStudyTime: 0,
              completedPods: 0,
            });

            return done(null, newUser);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Passport serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors,
        });
      }

      const { email, password, firstName, lastName } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        googleId: null,
        authProvider: "email",
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        linkedInId: null,
        githubId: null,
        role: "student",
        studyGoals: null,
        preferredSubjects: null,
        learningPace: null,
        availability: null,
        studyStreak: 0,
        totalPoints: 0,
        globalRank: null,
        totalStudyTime: 0,
        completedPods: 0,
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.errors,
      });
    }

    passport.authenticate("local", (err: any, user: DBUser | false, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=google_auth_failed" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/");
    }
  );

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}

// Middleware to check authentication
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}
