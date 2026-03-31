(function () {
  if (sessionStorage.getItem("_visitor_notified")) return;
  sessionStorage.setItem("_visitor_notified", "1");
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: document.title || window.location.pathname,
      time: new Date().toLocaleString("zh-CN"),
      referrer: document.referrer || ""
    })
  }).catch(function () { });
})();
