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

const timeBar = gElem('.timeBar');
//--------------------------------------------------------
//----------------- Time Line ----------------------------
//--------------------------------------------------------

const renderTimeLine = function(hours) {
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

//--------------------------------------------------------
//--------------------- Tasks ----------------------------
//--------------------------------------------------------
class Tasks {
   constructor() {
      this.daylyTasks = this._neighborCheck();
      this.renderTasks();
   }

   _neighborCheck() {
      const rangedTasks = tasks.map(task => {
         return this._takeRange(task); 
      });
      const result = rangedTasks.map((task) => {
         task.isNeighbor = false;
         rangedTasks.forEach(item => {
            if (task.range[0] < item.range[0] && task.range[1] > item.range[0]) {
               task.isNeighbor !== 'right' && (task.isNeighbor = 'left');
               return;
            } else if (task.range[0] < item.range[1] && task.range[1] > item.range[1]) {
               item.isNeighbor !== 'right' ? task.isNeighbor = 'right' : task.isNeighbor = 'left';
               return;
            }
         })
         return task;
      })
      return result;
   }

   _takeRange(item) {
      item.range = [item.start, item.start + item.duration];
      return item;
   }

   _createTask(task, isNeighbor, color = `110,158,207`) {
      let boxIndent = '70px';
      let boxWidth = `calc(100% - 90px)`;
      if (isNeighbor === 'left') {
         boxWidth = `calc(50% - 45px)`;
      } else if (isNeighbor === 'right') {
         boxIndent = `calc(50% + 25px)`;
         boxWidth = `calc(50% - 45px)`;
      }

      const taskTitle = cElem('div', 'taskTitle', `${task.title}`);
      const taskBox = cElem('div', 'taskBox');
      // const taskLeftLine = cElem('div', 'taskLeftLine');
      // taskLeftLine.style.background = `rgba(${color})`
      taskBox.append(taskTitle);
      taskBox.style.height = `${task.duration*2}px`;
      taskBox.style.width = boxWidth;
      taskBox.style.top = `${task.start*2+20}px`;
      taskBox.style.left = boxIndent;
      taskBox.style.background = `rgba(${color}, .5)`;
      taskBox.style.borderLeft = `3px solid rgba(${color}, 1)`;
      return taskBox;
   }

   renderTasks() {
      timeBar.innerHTML = '';
      renderTimeLine(9);


      this.daylyTasks.forEach(task => {
         timeBar.append(this._createTask(task, task.isNeighbor))
      })
   }
   
}

calendar = new Tasks();







