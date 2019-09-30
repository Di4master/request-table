const requests = [
    {id: 1, date: '05.08.2019', priority: 3, device: 'HP LaserJet Pro M281fdw', type: 'Принтер', department: 'Производственный отдел'},
    {id: 2, date: '06.08.2019', priority: 2, device: 'Lenovo IdeaCentre AIO 520-27', type: 'Стационарный компьютер', department: 'Отдел продаж'},
    {id: 3, date: '06.08.2019', priority: 1, device: 'Brother DCP-L2520DWR', type: 'МФУ', department: 'Производственный отдел'},
    {id: 4, date: '05.08.2019', priority: 3, device: 'Apple MacBook Air 13', type: 'Ноутбук', department: 'Отдел продаж'},
    {id: 5, date: '07.08.2019', priority: 1, device: 'HP ProBook 450 G5', type: 'Ноутбук', department: 'Бухгалтерия'},
    {id: 6, date: '07.08.2019', priority: 3, device: 'Epson EH-TW5400', type: 'Прочее периферийное устройство', department: 'Отдел продаж'},
];

class RequestTable {
    constructor (requests) {
        this.requests = [...requests];
        this.typeSet = new Set();
        this.departmentSet = new Set();
        this.lastId = this.findLastId();
        this.filters = {
            device: null,
            type: null,
            department: null
        };
        this.currentSort = 'id';
    }

    getDateTime(value) {
        const date = value ? new Date(value) : new Date();
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        const timeStamp = `${day}.${month}.${date.getFullYear()} ${hours}:${minutes}:${seconds}`;
        return timeStamp;
    }

    // Создание коллекций для фильтров
    setCategories() {
        this.requests.forEach(request => {
            this.typeSet.add(request.type);
            this.departmentSet.add(request.department);
        });

        requestFilters.fillFilters(this.typeSet, this.departmentSet);
        requestInput.fillInput(this.typeSet, this.departmentSet);
    }

    findLastId() {
        let maxId = 0;
        this.requests.forEach(request => {
            if (request.id > maxId) {
                maxId = request.id;
            }
        });
        return maxId;
    }

    // Добавление новой заявки в массив
    addRequestData(newData) {
        const { priority, device, type, department } = newData;
        this.requests.push({
            id: ++this.lastId,
            date: this.getDateTime(),
            priority,
            device,
            type,
            department
        });
    }

    // Сохранение измененной завяки в массив
    editRequestData(newData, request) {
        Object.assign(request, newData);
    }

    // Удаление заявки из массива
    deleteRequest(requestId) {
        for (let i = 0; i < this.requests.length; i++) {
            if (this.requests[i].id === +requestId) {
                this.requests.splice(i, 1);
                break;
            }
        }
        this.refreshTable();
    }

    refreshTable() {
        this.sortData();
        requestList.clearTable();
        const filteredRequests = this.requests.filter((request) => this.filter(request));
        requestList.fillTable(filteredRequests);
    }

    sortData(key = this.currentSort, secondKey) {
        if (secondKey) {
            this.requests.sort(this.compare(key, secondKey));
        } else {
            this.requests.sort( (a, b) => a[key] - b[key] );
        }
    }

    compare(key, secondKey) {
        return function(a, b) {
            if (a[key] > b[key]) return 1;
            if (a[key] < b[key]) return -1;
            if (a[secondKey] > b[secondKey]) return 1;
            if (a[secondKey] < b[secondKey]) return -1;
            return 0;
        }
    }

    filter(request) {
        for (let key in this.filters) {
            if (this.filters[key] === null) continue;
            switch (key) {
                case 'device':
                    const deviceStr = request[key].toLowerCase();
                    const searchStr = this.filters[key].toLowerCase();
                    if (deviceStr.indexOf(searchStr) < 0) return false;
                    break;
                default:
                    if (this.filters[key] !== request[key]) return false;
                    break;
            }
        }
        return true;
    }
    
    clearFilters() {
        for (let key in this.filters) {
            this.filters[key] = null;
        }
    }
    
    onEditRequest(requestId) {
        const request = this.requests.find((element) => {
            return element.id === +requestId;
        });
        requestInput.editRequestState(request);
    }
}

class ElemConstructor {

    // Конструктор элементов, аргументы: {тег, класс, родитель, html-содержимое, аттрибуты}
    createElement(options) {
        const {tag, parentElem, className, innerHtml, attributes} = options;
        const block = document.createElement(tag);
        (typeof parentElem === "object") ? parentElem.append(block) : document.querySelector(`.${parentElem}`).append(block);
        if (className) block.className = className;
        if (innerHtml) block.innerHTML = innerHtml;
        if (attributes) attributes.forEach(elem => {
            block.setAttribute(elem[0], elem[1]);
        });

        return block;
    }

    // Создание элементов options на основе сета с данными
    getOptionsList(setName, elemClass) {
        const set = Array.from(setName).sort();
        for (let item of set) {
            const option = this.createElement({tag: 'option', parentElem: elemClass, innerHtml: item});
            option.setAttribute('value', item);
        }
    }
}

class Filters extends ElemConstructor {

    displayFilters() {
        this.createElement({tag: 'h1', parentElem: 'wrapper', className: 'header', innerHtml: 'Заявки на ремонт оборудования'});
        this.createElement({tag: 'form', parentElem: 'wrapper', className: 'filters'});
        this.createElement({tag: 'select', parentElem: 'filters', className: 'select-sort'});

        this.createElement({
            tag: 'input',
            parentElem: 'filters',
            className: 'search-device',
            attributes: [
                ['type', 'text'],
                ['placeholder', 'Поиск по устройству']
            ]
        });

        this.createElement({
            tag: 'select',
            parentElem: 'filters',
            className: 'select-type',
            innerHtml: '<option value="" selected>Фильтр по типу</option>'
        });

        this.createElement({
            tag: 'select',
            parentElem: 'filters',
            className: 'select-department',
            innerHtml: '<option value="" selected>Фильтр по отделу</option>'
        });

        this.createElement({tag: 'button', parentElem: 'filters', className: 'form-refresh', innerHtml: 'Сбросить фильтры'});
    }

    fillFilters(typeSet, departmentSet) {
        this.createElement({tag: 'option', parentElem: 'select-sort', innerHtml: 'Сортировать по дате'}).setAttribute('value', 'id');
        this.createElement({tag: 'option', parentElem: 'select-sort', innerHtml: 'Сортировать по приоритету'}).setAttribute('value', 'priority');
        this.getOptionsList(typeSet, 'select-type');
        this.getOptionsList(departmentSet, 'select-department');
    }

    addEvents() {

        document.addEventListener('input', () => {            
            if (event.target.className === 'select-sort') {
                requestTable.currentSort = event.target.value;
                requestTable.refreshTable();
            }
            if (event.target.className === 'search-device') {
                const input = event.target.value;
                requestTable.filters.device = input !== '' ?  input : null;
                requestTable.refreshTable();
            }
            if (event.target.className === 'select-type') {
                const input = event.target.value;
                requestTable.filters.type = input !== '' ?  input : null;
                requestTable.refreshTable();
            }

            if (event.target.className === 'select-department') {
                const input = event.target.value;
                requestTable.filters.department = input !== '' ?  input : null;
                requestTable.refreshTable();
            }
        });

        document.querySelector('.filters').addEventListener('submit', () => {
            event.preventDefault();
            event.target.reset();
            requestTable.currentSort = 'id';
            requestTable.clearFilters();
            requestTable.refreshTable();
        });
    }
}

class List extends ElemConstructor {

    // Создаение строки в таблице и заполнение данными текущей заявки
    createCells(parentNode, request) {
        const {id, date, priority, device, type, department} = request;
        this.createElement({tag: 'div', parentElem: parentNode, className: 'requests__cell id', innerHtml: id});
        this.createElement({tag: 'div', parentElem: parentNode, className: 'requests__cell id', innerHtml: device});
        this.createElement({tag: 'div', parentElem: parentNode, className: 'requests__cell id', innerHtml: type});
        this.createElement({tag: 'div', parentElem: parentNode, className: 'requests__cell id', innerHtml: department});
        this.createElement({tag: 'div', parentElem: parentNode, className: 'requests__cell id', innerHtml: this.displayPriorityState(priority)});
        this.createElement({tag: 'div', parentElem: parentNode, className: 'requests__cell id', innerHtml: date});
    }

    // Отображение прирритета в виде индикатора
    displayPriorityState(priority) {
        if (!isNaN(priority)) {
            return `<div class="priority priority-${priority} requests__priority"></div>`;
        }
        return priority;
    }

    displayTable() {
        this.createElement({tag: 'div', parentElem: 'wrapper', className: 'requests'});
        this.createElement({tag: 'div', parentElem: 'requests', className: 'requests__thead'});
        const row = this.createElement({tag: 'div', parentElem: 'requests__thead', className: 'requests__row'});
        const headers = {
            id: 'id заявки',
            date: 'Время создания',
            priority: 'Приоритет',
            device: 'Устройство',
            type: 'Тип',
            department: 'Отдел'
        };
        this.createCells(row, headers);
        this.createElement({tag: 'div', parentElem: 'requests', className: 'requests__tbody'});
    }

    clearTable() {
        document.querySelector('.requests__tbody').innerHTML = '';
    }

    fillTable(requests) {
        const tbody = document.querySelector('.requests__tbody');

        for (let request of requests) {
            const row = this.createElement({tag: 'div', parentElem: tbody, className: 'requests__row'});
            this.createCells(row, request);
            const buttonCell = this.createElement({tag: 'div', parentElem: row, className: 'requests__cell buttons'});
            this.createElement({
                tag: 'button',
                parentElem: buttonCell,
                className: 'edit',
                innerHtml: '<img src="icons/edit.svg" width="20px" height="20px" alt="">'});
            this.createElement({
                tag: 'button',
                parentElem: buttonCell,
                className: 'delete',
                innerHtml: '<img src="icons/delete.svg" width="20px" height="20px" alt="">'});
        };

        if (!tbody.hasChildNodes()) {
            this.createElement({tag: 'h2', parentElem: tbody, className: 'message', innerHtml: 'Заявок не найдено'});
        };
    }

    addEvents() {
        document.addEventListener('click', () => {
            if (event.target.closest('.edit')) {
                const prevEditRow = document.querySelector('.requests__row--active');
                if (prevEditRow) prevEditRow.classList.remove('requests__row--active');
                const row = event.target.closest('.requests__row');
                row.classList.add('requests__row--active');
                const requestId = row.querySelector('.id').innerHTML;

                requestTable.onEditRequest(requestId);
            }

            if (event.target.closest('.delete')) {
                const requestId = event.target.closest('.requests__row').querySelector('.id').innerHTML;

                requestTable.deleteRequest(requestId);
            }
        });
    }
}

class Input extends ElemConstructor {

    constructor () {
        super();

        this.requestOnEdit = null;
    }

    displayInputForm() {
        this.createElement({tag: 'div', parentElem: 'wrapper', className: 'input-form-wrapper'});
        this.createElement({tag: 'h1', parentElem: 'input-form-wrapper', className: 'header', innerHtml: 'Новая заявка'});
        const form = this.createElement({tag: 'form', parentElem: 'input-form-wrapper', className: 'input-form'});

        this.createElement({
            tag: 'input',
            parentElem: form,
            className: 'device-input',
            attributes: [
                ['placeholder', 'Название устройства'],
                ['required', '']
            ]
        });

        this.createElement({
            tag: 'select',
            parentElem: form,
            className: 'type-input',
            innerHtml: '<option value="" disabled selected>Тип устройства</option>',
            attributes: [ ['required', ''] ]
        });

        this.createElement({
            tag: 'select',
            parentElem: form,
            className: 'department-input',
            innerHtml: '<option value="" disabled selected>Наименование отдела</option>',
            attributes: [ ['required', ''] ]
        });

        const priority = this.createElement({tag: 'div', parentElem: form, className: 'priority-block', innerHtml: 'Приоритет:'});
        this.createElement({tag: 'label', parentElem: priority, className: 'priority-label', innerHtml: this.getPriorityLed(3)});
        this.createElement({tag: 'label', parentElem: priority, className: 'priority-label', innerHtml: this.getPriorityLed(2)});
        this.createElement({tag: 'label', parentElem: priority, className: 'priority-label', innerHtml: this.getPriorityLed(1)});
        document.querySelector('[type="radio"]').checked = true;

        this.createElement({tag: 'button', parentElem: form, className: 'request-input', innerHtml: 'Добавить заявку'});
    }

    getPriorityLed(value) {
        return `
            <input type="radio" name="priorityRadio" value="${value}">
            <div class="priority-${value} priority"></div>
        `;
    }

    fillInput(typeSet, departmentSet) {
        this.getOptionsList(typeSet, 'type-input');
        this.getOptionsList(departmentSet, 'department-input');
    }
    
    editRequestState(request) {
        this.requestOnEdit = request;
        const form = document.querySelector('.input-form-wrapper');
        form.querySelector('.header').textContent = `Изменить заявку № ${request.id} от ${request.date}`;
        form.querySelector('.device-input').value = `${request.device}`;

        const typeInput = document.querySelector('.type-input');
        for (let option of typeInput.options) {
            option.value === request.type ? option.selected = true : option.selected = false;
        };

        const departmentInput = document.querySelector('.department-input');
        for (let option of departmentInput.options) {
            option.value === request.department ? option.selected = true : option.selected = false;
        };

        const priorityInputs = document.querySelector('.priority-block').querySelectorAll('.priority');
        for (let input of priorityInputs) {
            const radio = input.previousElementSibling;
            +radio.value === +request.priority ? radio.checked = true : radio.checked = false;
        };
        
        form.querySelector('.request-input').textContent = 'Сохранить';
    }

    newRequestState() {
        const form = document.querySelector('.input-form-wrapper');
        form.querySelector('.header').textContent = 'Новая заявка';
        form.querySelector('.request-input').textContent = 'Добавить заявку';
    }

    compileData() {
        const data = {};
        data.priority = document.querySelector('[type="radio"]:checked').value;
        data.device = document.querySelector('.device-input').value;
        data.type = document.querySelector('.type-input').value;
        data.department = document.querySelector('.department-input').value;
        return data;
    }

    addEvents() {
        document.querySelector('.input-form').addEventListener('submit', () => {
            event.preventDefault();
            
            if (this.requestOnEdit) {
                requestTable.editRequestData( this.compileData(), this.requestOnEdit )
                this.newRequestState();
                this.requestOnEdit = null;
            } else {
                requestTable.addRequestData( this.compileData() );
            }

            event.target.reset();
            document.querySelector('[type="radio"]').checked = true;
            requestTable.refreshTable();
        });
    }
}


const requestTable = new RequestTable(requests);

// Актуализация дат ранее созданных заявок
let timestamp = Date.now() - 133423423;
requestTable.requests.forEach(element => {
    element.date = requestTable.getDateTime(timestamp+= 21342323);
});

const requestFilters = new Filters();
requestFilters.displayFilters();
requestFilters.addEvents();

const requestList = new List();
requestList.displayTable();
requestList.addEvents();

const requestInput = new Input();
requestInput.displayInputForm();
requestInput.addEvents();

requestTable.setCategories();
requestTable.refreshTable();