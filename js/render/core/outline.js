(function() {
  // d3-plugin for calculating outline paths
  // License: https://github.com/d3/d3-plugins/blob/master/LICENSE
  //
  // Copyright (c) 2012-2014, Michael Bostock
  // All rights reserved.
  //
  //  Redistribution and use in source and binary forms, with or without
  //  modification, are permitted provided that the following conditions are met:
  //* Redistributions of source code must retain the above copyright notice, this
  //  list of conditions and the following disclaimer.
  //* Redistributions in binary form must reproduce the above copyright notice,
  //  this list of conditions and the following disclaimer in the documentation
  //  and/or other materials provided with the distribution.
  //* The name Michael Bostock may not be used to endorse or promote products
  //  derived from this software without specific prior written permission.
  // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
  geom = {}; 
  geom.contour = function(grid, start) { 
    var s = start || d3_geom_contourStart(grid), // starting point 
        c = [],    // contour polygon 
        x = s[0],  // current x position 
        y = s[1],  // current y position 
        dx = 0,    // next x direction 
        dy = 0,    // next y direction 
        pdx = NaN, // previous x direction 
        pdy = NaN, // previous y direction 
        i = 0; 

    do { 
      // determine marching squares index 
      i = 0; 
      if (grid(x-1, y-1)) i += 1; 
      if (grid(x,   y-1)) i += 2; 
      if (grid(x-1, y  )) i += 4; 
      if (grid(x,   y  )) i += 8; 

      // determine next direction 
      if (i === 6) { 
        dx = pdy === -1 ? -1 : 1; 
        dy = 0; 
      } else if (i === 9) { 
        dx = 0; 
        dy = pdx === 1 ? -1 : 1; 
      } else { 
        dx = d3_geom_contourDx[i]; 
        dy = d3_geom_contourDy[i]; 
      } 

      // update contour polygon 
      if (dx != pdx && dy != pdy) { 
        c.push([x, y]); 
        pdx = dx; 
        pdy = dy; 
      } 

      x += dx; 
      y += dy; 
    } while (s[0] != x || s[1] != y); 

    return c; 
  }; 

  // lookup tables for marching directions 
  var d3_geom_contourDx = [1, 0, 1, 1,-1, 0,-1, 1,0, 0,0,0,-1, 0,-1,NaN], 
      d3_geom_contourDy = [0,-1, 0, 0, 0,-1, 0, 0,1,-1,1,1, 0,-1, 0,NaN]; 

  function d3_geom_contourStart(grid) { 
    var x = 0, 
        y = 0; 

    // search for a starting point; begin at origin 
    // and proceed along outward-expanding diagonals 
    while (true) { 
      if (grid(x,y)) { 
        return [x,y]; 
      } 
      if (x === 0) { 
        x = y + 1; 
        y = 0; 
      } else { 
        x = x - 1; 
        y = y + 1; 
      } 
    } 
  } 

})();

class Outline {
  constructor(){
    this.dom = {};
    
    this.dom.canvas = document.createElement('canvas');
    this.dom.canvas.width = CONFIG.finalSize.width;
    this.dom.canvas.height = CONFIG.finalSize.height;

    this.canvas = this.dom.canvas.getContext('2d');
    this.canvas.imageSmoothingEnabled = false;
    this.data = null;
    this.points = null;

    this.lineWidth = 2;
    this.lineColor = '#ff0000';

    this._link();
  }

  defineNonTransparent(x,y){
    var a = this.data[(y*this.dom.canvas.width+x)*4+3];
    return(a>0);
  }

  _getImgData(img){
    this.dom.canvas.width = img.width;
    this.dom.canvas.height = img.height;
    this.canvas.clearRect(0, 0, img.width, img.height);
    this.canvas.drawImage(img, 0, 0);

    var imgData = this.canvas.getImageData(0, 0, img.width, img.height);
    this.data = imgData.data;
    this.points = geom.contour(this.defineNonTransparent.bind(this));
  }
  // draw(img){
  //   this._getImgData(img);

  //   this.canvas.strokeStyle = "#ff0000";
  //   this.canvas.lineWidth = 1;

  //   // draw the outline path
  //   this.canvas.beginPath();
  //   this.canvas.moveTo(this.points[0][0], this.points[0][4]);
  //   for(var i=1;i<this.points.length;i++){
  //     var point = this.points[i];
  //     this.canvas.lineTo(point[0], point[1]);
  //   }
  //   this.canvas.closePath();
  //   this.canvas.stroke();
    
  //   // -- create img
  //   var img = new Image();
  //   img.src = this.dom.canvas.toDataURL();

  //   return img;
  // }

  draw(img, cb){
    this.dom.canvas.width = img.width;
    this.dom.canvas.height = img.height;
    this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);

    var dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
      s = this.lineWidth,  // thickness scale
      i = 0,  // iterator
      x = 0,  // final position
      y = 0;
  
    // draw images at offsets from the array scaled by s
    for(; i < dArr.length; i += 2)
      this.canvas.drawImage(img, x + dArr[i]*s, y + dArr[i+1]*s);
    
    // fill with color
    this.canvas.globalCompositeOperation = "source-in";
    this.canvas.fillStyle = this.lineColor;
    this.canvas.fillRect(0,0,this.dom.canvas.width, this.dom.canvas.height);
    
    // draw original image in normal mode
    this.canvas.globalCompositeOperation = "source-over";
    this.canvas.drawImage(img, x, y);

    // -- create img
    var img = new Image();
    img.onload = this._resizeOutline.bind(this, img, cb);
    // img.onload = cb.bind(this, img);
    img.src = this.dom.canvas.toDataURL();

    // return img;
  }

  _resizeOutline(img, cb){
    this.dom.canvas.width = CONFIG.finalSize.width;
    this.dom.canvas.height = CONFIG.finalSize.height;

    this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
    this.canvas.save();
    this.canvas.drawImage(img, 0, 0, img.width, img.height, 0, 0, CONFIG.finalSize.width, CONFIG.finalSize.height);
    this.canvas.restore();
    // -- outline images
    var oImg = new Image();
    oImg.onload = function(){
      cb(oImg);
    }.bind(this);
    oImg.src = this.dom.canvas.toDataURL();
    // this.outlineImages.push(oImg);
  }

  _outlineChange(e){
    this.lineWidth = e.data.width;
    this.lineColor = e.data.color;
  }

  _link(){
    GAME.signals.addListener(this, 'outline.change', this._outlineChange.bind(this));
  }
}


// var Outline = function(rootElm){
//   this.dom = {};
//   this.dom.rootElm = rootElm;
//   this.outlineState = false;
//   this.outlineColor = '#fff';

//   this._makeDOM();
// };

// Outline.prototype = {
//   _makeDOM : function(){
//     // this.dom.title = document.createElement('h3');
//     // this.dom.title.className = 'title';
//     // this.dom.title.innerHTML = 'Outline:'
//     // this.dom.rootElm.appendChild(this.dom.title);

//     // ------------------------
//     // -- outline inputs
//     var div = document.createElement('div');

//     var label = document.createElement('label');
// 		label.innerHTML = 'outline:';
// 		div.appendChild(label);

//     this.dom.outlineCheck = document.createElement('input');
//     this.dom.outlineCheck.type = 'checkbox';
//     this.dom.outlineCheck.value = 0;
//     this.dom.outlineCheck.checked = this.outlineState;
//     this.dom.outlineCheck.addEventListener('change', this._outlineSwitch.bind(this));
//     div.appendChild(this.dom.outlineCheck);

//     this.dom.rootElm.appendChild(div);

//     // -- color
//     var div1 = document.createElement('div');

//     var label1 = document.createElement('label');
// 		label1.innerHTML = 'outline color:';
// 		div1.appendChild(label1);

//     this.dom.outlineColor = document.createElement('input');
//     this.dom.outlineColor.type = 'color';
//     this.dom.outlineColor.addEventListener('change', this._outlineColor.bind(this));
//     div1.appendChild(this.dom.outlineColor);

//     this.dom.rootElm.appendChild(div1);
//   },

//   _outlineSwitch : function(e){
//     var elm = e.target;
//     this.outlineState = elm.checked;
//     GAME.signals.makeEvent('outline.change', window, { outline : this.outlineState });
//   },

//   _outlineColor : function(e){
//     var elm = e.target;
//     this.outlineColor = elm.value;
//     GAME.signals.makeEvent('outline.color', window, { color : this.outlineColor });
//   },
// }
