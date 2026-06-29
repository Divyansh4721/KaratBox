module.exports.setFlash = function (req, res, next) {
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error")
  };
  res.locals.breadcrumbs = undefined;
  res.locals.breadcrumbLabel = undefined;
  res.locals.hideBreadcrumb = undefined;
  next();
};
