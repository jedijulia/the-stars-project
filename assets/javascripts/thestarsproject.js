require.config({
    paths: {
        'jquery': '../../bower_components/jquery/jquery',
        'gradient-descent': '../../bower_components/gradient-descent/src/gradient-descent'
    }
});

require(['jquery', 'gradient-descent'], function($, GradientDescent) {
    $('main').on('click', 'section.clickable:not(.focus)', function() {
        $('section').not(this).removeClass('focus').addClass('blur');
        $(this).removeClass('blur').addClass('focus');
    });

    $('input[type="file"]').on('change', function() {
        $(this).next('p').text(this.files[0].name);
    });

    // demo for changing the look of the button and showing the
    // corresponding result message. REMOVE THIS LATER.
    // $('button').on('click', function() {
    //     $(this).addClass('okay');
    //     $(this).siblings('h3').addClass('okay');
    // });



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
        $('#train').addClass('clickable');
        $(this).addClass('okay');
    });

    $('#train button').on('click', function() {
        var button = $(this);
        var training_input = $('input[name="training-data"]').get(0);
        if (training_input.files.length) {
            button.addClass('loading');
            var training = parse(training_input.files[0]);
            training.done(function(training_data) {
                gd.train(training_data);
                gd.subscribe('done', function(e) {
                    button.toggleClass('loading okay');
                    button.siblings('h3').html('cost: <strong>' + e.cost + '</strong>').addClass('okay');
                    $('#validate').addClass('clickable');
                });
            });
        }
    });

    $('#validate button').on('click', function() {
        var button = $(this);
        var validation_input = $('input[name="validation-data"]').get(0);
        if (validation_input.files.length) {
            button.addClass('loading');
            var validation = parse(validation_input.files[0]);
            validation.done(function(validation_data) {
                var mse = gd.validate(validation_data);
                button.toggleClass('loading okay');
                button.siblings('h3').html('mse: <strong>' + mse + '</strong>').addClass('okay');
            });
        }
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