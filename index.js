var spritezero = require('@mapbox/spritezero');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Convert an SVG directory to sprite'
});

parser.addArgument(
    ['-i', '--input'],
    {
        help: 'Directory with svgs',
        required: true
    }
);

parser.addArgument(
    ['-o', '--output'],
    {
        help: 'Output directory',
        required: true
    }
);

parser.addArgument(
    ['-n', '--name'],
    {
        help: 'Base name of the sprite',
        required: true
    }
);

var args = parser.parseArgs();

[1, 2, 4, 8].forEach(function(pxRatio) {
    var svgs = glob.sync(path.resolve(args.input + '/*.svg'))
        .map(function(f) {
            return {
                svg: fs.readFileSync(f),
                id: path.basename(f).replace('.svg', '')
            };
        });

    var prefix = pxRatio > 1 ? '@' + pxRatio + 'x' : '';
    var pngPath = path.resolve(path.join(args.output, args.name + prefix + '.png'));
    var jsonPath = path.resolve(path.join(args.output, args.name + prefix + '.json'));

    // Pass `true` in the layout parameter to generate a data layout
    // suitable for exporting to a JSON sprite manifest file.
    spritezero.generateLayout({ imgs: svgs, pixelRatio: pxRatio, format: true, removeOversizedIcons: false }, function(err, dataLayout) {
        if (err) return;
        fs.writeFileSync(jsonPath, JSON.stringify(dataLayout));
    });

    // Pass `false` in the layout parameter to generate an image layout
    // suitable for exporting to a PNG sprite image file.
    spritezero.generateLayout({ imgs: svgs, pixelRatio: pxRatio, format: false, removeOversizedIcons: false }, function(err, imageLayout) {
        spritezero.generateImage(imageLayout, function(err, image) {
            if (err) return;
            fs.writeFileSync(pngPath, image);
        });
    });
});
