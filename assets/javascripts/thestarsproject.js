require.config({
    paths: {
        'jquery': '../../bower_components/jquery/jquery',
        'gradient-descent': '../../bower_components/gradient-descent/src/gradient-descent'
    }
});

require(['jquery', 'gradient-descent'], function($, GradientDescent) {
    $('#input').on('change', function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            // @todo parse read data to javascript objects
            //       note: read data is in e.target.result
        };
        reader.readAsText(file);
    });

    var gd = new GradientDescent({ features: 2, cost_threshold: 0.01, alpha: 0.1 });
    gd.train();
});