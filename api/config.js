// Serves public runtime config from Vercel Environment Variables.
// (Firebase web config is designed to be public; real protection is Firestore rules.)
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
  res.status(200).json({
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      appId: process.env.FIREBASE_APP_ID || ""
    },
    adminId: process.env.ADMIN_ID || "admin"
  });
};
