p5.disableFriendlyErrors = true; //small performance boost
function preload(){
  name = "input_image.png"
  img = loadImage(name)
  copy = loadImage(name)
}

function setup(){
	setup_variables();
	fixedImage();
	input = createFileInput(handleImage);
	input.position(250, 100);
	input.class("file:bg-indigo-500 bg-white pr-2 file:text-white file:p-2 file:border-0 m-2 text-sm rounded-lg shadow-md shadow-indigo-200");
	colorsAt = {
		1: [base_color, 1],
		3: ["blue", 0.3],
		11: ["yellow",  0.25],
		15: ["white",  0.25],
	}
}

function setup_variables(){
	range = 255 // max color value
	layers = 20 // stl model layers
	layer = 1
	base_color = 'black'
	subd = parseInt(range/layers)
	prev_color = []
	dest_color = ''
	total = Date.now()
	existing = document.getElementById('existing-canvas')
	final_w = existing.parentElement.offsetWidth
}

function fixedImage() {
	img.resize(final_w/2, 0);
	copy.resize(final_w/2, 0);
	img.loadPixels()
	copy.loadPixels()
	createCanvas(final_w + 20, img.height, existing);
}

function draw() {
  if(layer <= layers) {
		if(typeof img !== 'undefined' && typeof copy !== 'undefined' && img.pixels && copy.pixels) {
			let time = Date.now()
			let thresh = parseInt(subd * (layer - 1)) // threshold to change pixels

			for(i = 0; i < img.pixels.length; i += 4){
				if (img.pixels[i + 3] == 0) continue; // skip on transparent pixels for png files

				orig_color = layer == 1 ? color(base_color) : color(copy.pixels[i], copy.pixels[i + 1], copy.pixels[i + 2])
				current_value = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2])/3

				if(current_value >= thresh){
					for(var cur_layer in colorsAt){
						if(layer <= cur_layer) {
							current_color = colorsAt[cur_layer]
							break
						}
					}
					color_layer(current_color)
				}
			}

			console.log("Layer " + layer + ", with "+ current_color + ", taking: " + (Date.now() - time)/1000.0 + "s")
			copy.updatePixels()
			image(copy, 0, 0)
			image(img, img.width + 20, 0)
			layer++
		}
	} else {
		console.log("Took:" + (Date.now() - total)/1000.0 + "s")
		noLoop()
  }
}

function color_layer(cur_color) {
	if(prev_color[0]	!= cur_color[0]){
		prev_color = cur_color
		dest_color = color(cur_color[0])
	}
  result = mixbox.lerp(orig_color.levels, dest_color.levels, cur_color[1]) // color mix using mixbox for accurate pigment mixing results
  copy.pixels[i + 0] = result[0]
  copy.pixels[i + 1] = result[1]
  copy.pixels[i + 2] = result[2]
}

function handleImage(file) {
  if (file.type === 'image') {
		img = loadImage(file.data, () => {
			copy = createImage(img.width, img.height)
			copy.copy(img, 0, 0, img.width, img.height, 0, 0, copy.width, copy.height)
			img.resize(final_w/2, 0);
			copy.resize(final_w/2, 0);
			img.loadPixels()
			copy.loadPixels()
			createCanvas(final_w, img.height, existing);
			loop()
		})
  } else {
    img = null;
		copy = null;
  }
}
