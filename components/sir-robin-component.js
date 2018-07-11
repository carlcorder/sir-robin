const ReglComponent = require('idyll-regl-component');
 
class SirRobinComponent extends ReglComponent {
 
  initialize(r, node) {
    // set the width, height of node
    //...
    let width = node.getBoundingClientRect().width;
    let height = width / 2;
    node.style.height = height + 'px';
    // then
    const regl = r(node);
    // your regl code here
    const RADIUS = 256
    const START_POSITION = 2 * RADIUS * (RADIUS + 1)

    const SIR_ROBIN = `4b2o$4bo2bo$4bo3bo$6b3o$2b2o6b4o$2bob2o4b4o$bo4bo6b3o$2b4o4b2o3bo$o9b2o$bo3bo$
                    6b3o2b2o2bo$2b2o7bo4bo$13bob2o$10b2o6bo$11b2ob3obo$10b2o3bo2bo$10bobo2b2o$
                    10bo2bobobo$10b3o6bo$11bobobo3bo$14b2obobo$11bo6b3o2$$11bo9bo$11bo3bo6bo$
                    12bo5b5o$12b3o$16b2o$13b3o2bo$11bob3obo$10bo3bo2bo$11bo4b2ob3o$13b4obo4b2o$
                    13bob4o4b2o$19bo$20bo2b2o$20b2o$21b5o$25b2o$19b3o6bo$20bobo3bobo$19bo3bo3bo$
                    19bo3b2o$18bo6bob3o$19b2o3bo3b2o$20b4o2bo2bo$22b2o3bo$21bo$21b2obo$20bo$19b5o$
                    19bo4bo$18b3ob3o$18bob5o$18bo$20bo$16bo4b4o$20b4ob2o$17b3o4bo$24bobo$28bo$
                    24bo2b2o$25b3o$22b2o$21b3o5bo$24b2o2bobo$21bo2b3obobo$22b2obo2bo$24bobo2b2o$
                    26b2o$22b3o4bo$22b3o4bo$23b2o3b3o$24b2ob2o$25b2o$25bo2$$24b2o$26bo!`

    let decode = (rle) => rle.replace(/[\n\s]/g,'')
            .replace(/(\d+)(\w)/g, (m,n,c) => new Array(parseInt(n)+1).join(c))

    let decoder = (rle) => {
        let rld = [];
        rle.replace('!','').split('$').forEach(s => rld.push(decode(s)))
        return rld
    }

    // reg, green, blue, alpha
    let rgbAlpha = (rld) => {// rld: run-length decoded
    return rld.map(s => s.split('').map(c => ({'b': 0, 'o': 255}[c])).map(x => [x,x,x,x]))
        .map(a => [].concat.apply([], a))
    }

    let initialize = (rle, p = START_POSITION) => {// p: starting position
        let rld = decoder(rle)
        let rgba = rgbAlpha(rld)
        let initialConditions = (Array(4 * RADIUS * RADIUS)).fill(0)
        for(let i = 0; i < rgba.length; i++) {
            for(let j = 0; j < rgba[i].length; j++) {
                initialConditions[p - i * 4 * RADIUS + j] = rgba[i][j]
            }
        }
        return initialConditions
    }

    const INITIAL_CONDITIONS = initialize(SIR_ROBIN)

    const state = (Array(2)).fill().map(() =>
    regl.framebuffer({
        color: regl.texture({
            radius: RADIUS,
            data: INITIAL_CONDITIONS,
            wrap: 'repeat'
        }),
        depthStencil: false
    }))

    const updateLife = regl({
        frag: `
        precision mediump float;
        uniform sampler2D prevState;
        varying vec2 uv;
        void main() {
            float n = 0.0;
            for(int dx = -1; dx <= 1; ++dx) {
                for(int dy = -1; dy <= 1; ++dy) {
                    n += texture2D(prevState, uv+vec2(dx,dy)/float(${RADIUS})).r;
                }
            }
            float s = texture2D(prevState, uv).r;
            if(n > 3.0 + s || n < 3.0) {
                gl_FragColor = vec4(0,0,0,1);
            } else {
                gl_FragColor = vec4(1,1,1,1);
            }
        }`,
        framebuffer: ({tick}) => state[(tick + 1) % 2]
    })

    const setupQuad = regl({
        frag: `
        precision mediump float;
        uniform sampler2D prevState;
        varying vec2 uv;
        void main() {
            float state = texture2D(prevState,uv).r;
            gl_FragColor = vec4(vec3(state),1);
        }`,
        vert: `
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
            uv = 0.5 * (position + 1.0);
            gl_Position = vec4(position,0,1);
        }`,
        attributes: { position: [-4,-4,4,-4,0,4] },
        uniforms: { prevState: ({tick}) => state[(tick) % 2] },
        depth: { enable: false },
        count: 3
    })

    regl.frame(() => {
        setupQuad(() => {
            regl.draw()
            updateLife()
        })
    })

  }
}

SirRobinComponent.defaultProps = {
    tick: 0
}
    
module.exports = SirRobinComponent;