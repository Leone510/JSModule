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
      this.daylyTasks = this.neighborCheck([...tasks]);
      this._getTasksFromLS();
      this.renderTasks();
   }

   _getTasksFromLS() {
      const tasksAsJson = localStorage.getItem('tasks');
      if (tasksAsJson !== null) {
         const tasks = JSON.parse(tasksAsJson);
         this.daylyTasks = tasks;
      }
   }

   _setTsksToLS() {
      const tasksAsJson = JSON.stringify(this.daylyTasks);
      localStorage.setItem('tasks', tasksAsJson);
   }

   settingForNewTask = {
      title: 'New event',
      startingTime: [4, 0],
      duration: 15,
      color: '110,158,207',
   }

   timeoutCheck() {
      return (
         (this.settingForNewTask.startingTime[0]*60 +
         this.settingForNewTask.startingTime[1] +
         this.settingForNewTask.duration) > 540
      )
   }

   neighborCheck(innerArr) {
      let id = 1;
      const rangedTasks = innerArr.map(task => {
         task.id = id++;
         let result;
         result = this.takeRange(task);
         if (result.color === undefined) {
            result.color = '110,158,207';
         }
         return result;
      });

      const arr = rangedTasks.map(task => {
         task.isNeighbor = false;
         rangedTasks.forEach(item => {
            if (item.id !== task.id) {
               if ((task.range[0] < item.range[0] && task.range[1] > item.range[0]) ||
               (task.range[0] < item.range[1] && task.range[1] > item.range[1])) {
                  task.isNeighbor = true;
                  return;
               }
               if (task.range[0] > item.range[0] && task.range[1] < item.range[1]){
                  task.isNeighbor = true;
                  task.surrounded = true;
                  return;
               }  
            }
         })

         return task;
      })

      let label = true;
      const result = arr.map(item => {
         item.neighbor = '';
         if (item.isNeighbor) {
            if (label) {
               item.neighbor = 'left';
            } else {
               item.neighbor = 'right';
            }
            if (!item.surrounded) {
               label = !label;
            }
         }
         return item;
      })
      return result;
   }

   takeRange(item) {
      item.range = [item.start, item.start + item.duration];
      return item;
   }

   _createTask(task) {
      let boxIndent = '70px';
      let boxWidth = `calc(100% - 90px)`;
      if (task.neighbor === 'left') {
         boxWidth = `calc(50% - 45px)`;
      } else if (task.neighbor === 'right') {
         boxIndent = `calc(50% + 25px)`;
         boxWidth = `calc(50% - 45px)`;
      }

      const taskTitle = cElem('div', 'taskTitle', `${task.title}`);
      const taskBox = cElem('div', 'taskBox');
      taskBox.onclick = () => {
         this.showModal(task);
      }
      taskBox.append(taskTitle);
      taskBox.style.height = `${task.duration*2}px`;
      taskBox.style.width = boxWidth;
      taskBox.style.top = `${task.start*2+20}px`;
      taskBox.style.left = boxIndent;
      taskBox.style.background = `rgba(${task.color}, .5)`;
      taskBox.style.borderLeft = `3px solid rgba(${task.color}, 1)`;
      return taskBox;
   }

   removeTask(id) {
      const index = this.daylyTasks.findIndex(item => {
         return item.id === id;
      })

      const cutsArr = this.daylyTasks;
      cutsArr.splice(index, 1);
      this.daylyTasks = this.neighborCheck(cutsArr);
      this.renderTasks();
   }

   placeCheck(task) {
      let coincidences = [];
      this.daylyTasks.forEach(item => {
         if (task.id !== item.id) {
            if ((task.range[0] <= item.range[0] && task.range[1] >= item.range[0]) ||
            (task.range[0] <= item.range[1] && task.range[1] >= item.range[1]) ||
            (task.range[0] >= item.range[0] && task.range[1] <=  item.range[1])) {
               coincidences.push(item);
            }
         }
      })
      if (!coincidences[0]) {
         return true;
      }

      for (let i = 0; i < coincidences.length; i++) {
         for(let j = i + 1; j < coincidences.length; j++) {
            if (
               (coincidences[i].range[0] <= coincidences[j].range[0] &&
               coincidences[i].range[1] >= coincidences[j].range[0]) ||

               (coincidences[i].range[0] <= coincidences[j].range[1] &&
               coincidences[i].range[1] >= coincidences[j].range[1]) ||

               (coincidences[i].range[0] >= coincidences[j].range[0] &&
               coincidences[i].range[1] <= coincidences[j].range[1])
            ){
               return false;
            } 
         }
      }
      return true;
   }

   showModal = (task) => {
      editModal.classList.add('active');
      const changetTitle = gElem('.changeTitle');
      changetTitle.value = task.title;
      const changetHour = gElem('.changeHour');
      changetHour.value = Math.trunc(task.start/60)+8;
      const changetMin = gElem('.changeMin');
      changetMin.value = task.start-((changetHour.value-8)*60);
      const changetDur = gElem('.changeDur');
      changetDur.value = task.duration;
      const applyBtn = gElem('.applyBtn');
      const checker = this.takeRange(
         {
            start: (Number(changetHour.value)-8)*60 + Number(changetMin.value),
            duration: Number(changetDur.value),
         })
      applyBtn.onclick = () => {
         if (this.placeCheck(checker)) {
            editModal.classList.remove('active');
            return;
         }
         if (
            ((Number(changetHour.value)-8)*60 + Number(changetMin.value))+
               Number(changetDur.value)> 540
         ) {
            editModal.classList.remove('active');
            return;
         }
         task.title = changetTitle.value;
         task.start = (Number(changetHour.value)-8)*60 + Number(changetMin.value);
         task.duration = Number(changetDur.value);
         this.daylyTasks = this.neighborCheck(this.daylyTasks);
         this.renderTasks();
         editModal.classList.remove('active');
      }
      const deleteBtn = gElem('.deleteBtn');
      deleteBtn.onclick = () => {
         this.removeTask(task.id);
         editModal.classList.remove('active');
      }
   }

   renderTasks() {
      timeBar.innerHTML = '';
      renderTimeLine(9);


      this.daylyTasks.forEach(task => {
         timeBar.append(this._createTask(task))
      })

      this._setTsksToLS();
   }
   
}

calendar = new Tasks();

//--------------------------------------------------------
//--------------------- Edit modal -----------------------
//--------------------------------------------------------

const editModal = gElem('.editModal');

//--------------------------------------------------------
//--------------------- Events ---------------------------
//--------------------------------------------------------

const setTaskName = gElem('.taskName');
setTaskName.oninput = (e) => {
   calendar.settingForNewTask.title = e.target.value;
}

const setTaskStartH = gElem('.inpHour');
setTaskStartH.onblur = (e) => {
   if (e.target.value >= 8 && e.target.value <= 16) {
      calendar.settingForNewTask.startingTime[0] = Number(e.target.value - 8);
   } else {
      e.target.value = 12;
   }
}

const setTaskStartM = gElem('.inpMin');
setTaskStartM.onblur = (e) => {
   if (e.target.value >= 0 && e.target.value < 60) {
      calendar.settingForNewTask.startingTime[1] = Number(e.target.value);
   } else {
      e.target.value = 00;
   }   
}

const setTaskDuration = gElem('.inpDuration');
setTaskDuration.onblur = (e) => {
   if (e.target.value >= 15 && e.target.value <= 360) {
      calendar.settingForNewTask.duration = Number(e.target.value);
   }
   e.target.value = 15;
}

const setTaskColorB = gElem('.blue');
setTaskColorB.onchange = (e) => {
   calendar.settingForNewTask.color = '110,158,207';
}

const setTaskColorR = gElem('.red');
setTaskColorR.onchange = (e) => {
   calendar.settingForNewTask.color = '155, 45, 48';
}

const setTaskColorG = gElem('.green');
setTaskColorG.onchange = (e) => {
   calendar.settingForNewTask.color = '68, 148, 74';
}

const setTaskColorY = gElem('.yellow');
setTaskColorY.onchange = (e) => {
   calendar.settingForNewTask.color = '255, 207, 72';
}

const newEventBtn = gElem('.newEventBtn');
newEventBtn.onclick = () => {
   if (calendar.timeoutCheck()) {
      return;
   }
   let newTask = {
      start: Number(calendar.settingForNewTask.startingTime[0])*60 +
         Number(calendar.settingForNewTask.startingTime[1]),
      duration: calendar.settingForNewTask.duration,
      title: calendar.settingForNewTask.title,
   }

   newTask.color = calendar.settingForNewTask.color;
   newTask = calendar.takeRange(newTask)

   if (calendar.placeCheck(newTask)) {
      calendar.daylyTasks.push(newTask)
   }
   calendar.daylyTasks.sort((a, b) => {
         return a.start - b.start;  
   });

   calendar.neighborCheck(calendar.daylyTasks);
   calendar.renderTasks();
}




