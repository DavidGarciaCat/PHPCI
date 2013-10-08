var locPlugin = PHPCI.UiPlugin.extend({
    id: 'build-lines-chart',
    css: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
    title: 'Lines of Code',
    lastData: null,
    displayOnUpdate: false,

    register: function() {
        var self = this;
        var query = PHPCI.registerQuery('phploc-lines', -1, {num_builds: 10, key: 'phploc'})

        $(window).on('phploc-lines', function(data) {
            self.onUpdate(data);
        });

        $(window).on('build-updated', function(data) {
            if (data.queryData.status > 1) {
                self.displayOnUpdate = true;
                query();
            }
        });

        google.load("visualization", "1", {packages:["corechart"]});
    },

    render: function() {
        return $('<div id="phploc-lines"></div>').text('This chart will display once the build has completed.');
    },

    onUpdate: function(e) {
        this.lastData = e.queryData;

        if (this.displayOnUpdate) {
            this.displayChart();
        }
    },

    displayChart: function() {
        var build = this.lastData;

        if (!build || !build.length) {
            return;
        }

        $('#phploc-lines').empty().animate({height: '275px'});

        var data = [["Build", "Lines", "Comment Lines", "Non-Comment Lines", "Logical Lines"]];
        for (var idx in build) {
            data.push(['Build ' + build[idx].build_id, parseInt(build[idx].meta_value.LOC), parseInt(build[idx].meta_value.CLOC), parseInt(build[idx].meta_value.NCLOC), parseInt(build[idx].meta_value.LLOC)]);
        }

        var data = google.visualization.arrayToDataTable(data);

        var options = {
            hAxis: {title: 'Builds'},
            vAxis: {title: 'Lines'},
            backgroundColor: { fill: 'transparent' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('phploc-lines'));
        chart.draw(data, options);
    }
});

PHPCI.registerPlugin(new locPlugin());