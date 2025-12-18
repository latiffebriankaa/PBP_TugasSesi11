module.exports = (req, res, next) => {
  const sekarang = new Date();
  const jam = sekarang.getHours();
  const izin = jam >= 8 && jam <= 18;

  if (!izin) {
    console.log(
      `[diblok] ${req.method} ${
        req.originalUrl
      } pada ${sekarang.toLocaleString()} (di luar jam 08:00-18:00)`
    );
    return res.status(403).json({
      error: "API hanya dapat diakses pukul 08.00-18.00",
      time: sekarang.toLocaleString(),
    });
  }

  next();
};
