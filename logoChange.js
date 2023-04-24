
let myImage = document.querySelector('.logo');

myImage.addEventListener('mouseover',function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'images/logo.png') {
      myImage.setAttribute('src','images/logo-hover.png');
    } else {
      myImage.setAttribute('src','images/logo.png');
    }
});
myImage.addEventListener('mouseleave',function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'images/logo.png') {
      myImage.setAttribute('src','images/logo-hover.png');
    } else {
      myImage.setAttribute('src','images/logo.png');
    }
});
