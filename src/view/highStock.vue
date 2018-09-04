<template>
		<div id="tv_chart_container"></div>
</template>
<script>
export default {
  mounted() {
    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    TradingView.onready(function() {
      var widget = (window.tvWidget = new TradingView.widget({
        fullscreen: true,
        symbol: "AAPL",
        interval: "D",
        container_id: "tv_chart_container",
        //	BEWARE: no trailing slash is expected in feed URL
        // "http://localhost:3030"
        datafeed: new Datafeeds.UDFCompatibleDatafeed(
          "https://demo_feed.tradingview.com"
        ),
        library_path: "charting_library/",
        locale: getParameterByName("lang") || "zh",
        //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
        drawings_access: {
          type: "black",
          tools: [{ name: "Regression Trend" }]
        },
        disabled_features: ["use_localstorage_for_settings"],
        enabled_features: ["study_templates"],
        charts_storage_url: "http://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        timezone: "Asia/Tokyo",
        user_id: "public_user_id",
        widgetbar: {
          details: true,
          watchlist: true,
          watchlist_settings: {
            default_symbols: ["NYSE:AA", "NYSE:AAL", "NASDAQ:AAPL"],
            readonly: false
          }
        }
      }));
    });
  }
};
</script>

