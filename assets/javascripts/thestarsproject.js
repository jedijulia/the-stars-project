require.config({
    paths: {
        'jquery': '../../bower_components/jquery/jquery',
        'gradient-descent': '../../bower_components/gradient-descent/src/gradient-descent'
    }
});

require(['jquery', 'gradient-descent'], function($, GradientDescent) {
    $('#training-input').on('change', function() {
        var training = parse(this.files[0]);
        training.done(function(training_data) {
            var gd = new GradientDescent({ features: 2, cost_threshold: 0.01, normalize: true });
            gd.train(training_data);
            gd.subscribe('done', function(e) {
                console.info('training done!');
                console.log('cost: ' + e.cost);
                console.log('thetas: ' + e.thetas);
            });
        });
    });

    function parse(file) {
        var deferred = $.Deferred();
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result.split('\n');
            var training_data = [];
            for (var i = 0; i < data.length; i++) {
                var line = data[i].replace(/ +/g, ' ').split(' ');
                var object = {
                    name: line.slice(0, line.length - 3).join(' '),
                    features: [parseFloat(line[line.length - 2].replace(/v|e/g, '')), parseFloat(line[line.length - 1])],
                    label: parseFloat(line[line.length - 3].replace(/v|e/g, ''))
                };
                training_data.push(object);
            }
            deferred.resolve(training_data);
        };
        reader.readAsText(file);
        return deferred.promise();
    }
});