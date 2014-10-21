require.config({
    paths: {
        'jquery': '../../bower_components/jquery/jquery',
        'gradient-descent': '../../bower_components/gradient-descent/src/gradient-descent'
    }
});

require(['jquery', 'gradient-descent'], function($, GradientDescent) {
    $('section.clickable:not(.focus)').on('click', function() {
        $('section').not(this).removeClass('focus').addClass('blur');
        $(this).removeClass('blur').addClass('focus');
    });

    $('input[type="file"]').on('change', function() {
        $(this).next('p').text(this.files[0].name);
    });

    // demo for changing the look of the button and showing the
    // corresponding result message. REMOVE THIS LATER.
    $('button').on('click', function() {
        $(this).addClass('okay');
        $(this).siblings('h3').addClass('okay');
    });



    /*
     * Integrating with the gradient descent library.
     */

    var gd = null;

    $('#configure button').on('click', function() {
        var features = parseInt($('input[name="features"]').val());
        var alpha = parseFloat($('input[name="alpha"]').val());
        var thetas = $('input[name="thetas"]').val().split(/, */g);
        for (var i = 0; i < thetas.length; i++) {
            thetas[i] = parseFloat(thetas[i]);
        }
        var cost_change_threshold = parseFloat($('input[name="cost_change_threshold"]').val());
        var normalize = $('input[name="normalize"]').prop('checked');
        gd = new GradientDescent({
            features: features,
            cost_change_threshold: cost_change_threshold,
            normalize: normalize,
            alpha: alpha,
            thetas: thetas
        });
    });

    $('#train button').on('click', function() {
        var training_input = $('input[name="training-data"]').get(0);
        if (training_input.files.length) {
            var training = parse(training_input.files[0]);
            training.done(function(training_data) {
                gd = new GradientDescent({ features: 2, cost_threshold: 0.01, normalize: true });
                gd.train(training_data);
                gd.subscribe('done', function(e) {
                    console.info('training done!');
                    console.log('cost: ' + e.cost);
                    console.log('thetas: ' + e.thetas);

                    console.info('validating...');
                    console.log('mse: ' + gd.validate(training_data));
                });
            });
        }
    });

    $('#validate button').on('click', function() {
        // @todo validate the gradient descent based on selected 
        //       validation data
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