<!doctype html>
<html>

  <head>
    <title>Fictional Animal Shelters of the World</title>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
    <script src="//js.maxmind.com/js/apis/geoip2/v2.0/geoip2.js"></script>
    <script>
      var fillInPage = (function () {
    var updateCityText = function (geoipResponse) {

        var link = "/shelter?lat=" + geoipResponse.location.latitude;
        link += "&lon=" +geoipResponse.location.longitude;

        /* It's possible that we won't have any names for this city */
        var cityName = geoipResponse.city.names.en || 'your city';

        /*
           most_specific_subdivision returns the smallest available
           subdivision (region) as defined in ISO 3166-2.
        */
        var regionName = geoipResponse.most_specific_subdivision.names.en;

        var cityHTML =
            '<a href="' + link + '">Find a great companion near '
            + cityName;

        if (cityName && regionName ) {
            cityHTML += ', ' + regionName;
        }
        cityHTML += '</a>.';

        $("#city").html(cityHTML);
    };

    var onSuccess = function (geoipResponse) {
        updateCityText(geoipResponse);
    };

    /* If we get an error we will */
    var onError = function (error) {
        return;
    };

    return function () {
        geoip2.city( onSuccess, onError );
    };
}());

fillInPage();
    </script>
  </head>

  <body>
    <p>
Hello, and welcome to Fictional Animal Shelters of Minnesota. If you're
      looking to adopt a new companion animal, we'd love to help you.
    </p>

    <p id="city"></p>

    <p>
      <a href="/about">Learn more about our work</a>.
    </p>

  </body>
</html>