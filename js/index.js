const cElem = (tagName, className, text) => {
   const elem = document.createElement(tagName);
   elem.className = className || '';
   elem.innerText = text || '';
   return elem;
}

const gElem = param => {
   const elem = document.querySelector(param);
   elem.clear = function() {
      this.innerHTML = '';
      return this;
   }
   elem.add = function (listOfElems) {
      this.append(...listOfElems);
      return this;
   }
   return elem;
}

const renderTimeLine = function(hours) {
   const timeBar = gElem('.timeBar');
   for (let i=1; i<=hours+1; i++) {
      let timeForScreen = '';
      i < 6 ? timeForScreen = `${i + 7}` : timeForScreen = `${i - 5}`;       
      const timeStep = cElem('div', 'hourTL', `${timeForScreen}:00`)
      const timeHalfStep = cElem('div', 'HalfHourTL', `${timeForScreen}:30`)
      timeBar.append(timeStep);
      if (timeForScreen === '5') {
         break;
      }
      timeBar.append(timeHalfStep);
   }
}

const taskContainer = gElem('.taskContainer');

renderTimeLine(9);






