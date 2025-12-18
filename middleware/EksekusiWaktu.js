module.exports = (req, res, next) => {
  const mulai = process.hrtime.bigint();

  res.on("finish", () => {
    const akhir = process.hrtime.bigint();
    const durasims = Number(akhir - mulai) / 1e6;
    console.log(
      `[Waktu Eksekusi] ${req.method} ${req.originalUrl} -> ${
        res.statusCode
      } - ${durasims.toFixed(2)} ms`
    );
  });

  next();
};
