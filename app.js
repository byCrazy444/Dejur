/**
 * Журнал дежурств — Класс A-2
 * Период: 02.10.2026 – 31.12.2026 (без выходных)
 */

// 1. Список учеников класса A-2 (21 ученик)
const STUDENTS = [
  { id: 1, name: "Boico Iaroslav" },
  { id: 2, name: "Cara Artiom" },
  { id: 3, name: "Coreşcov Nicolai" },
  { id: 4, name: "Daniliuc Irina" },
  { id: 5, name: "Esipciuc Alexandr" },
  { id: 6, name: "Esipciuc Natalia" },
  { id: 7, name: "Iscra Serghei" },
  { id: 8, name: "Jurjiu Larisa" },
  { id: 9, name: "Licenco Stanislav" },
  { id: 10, name: "Liciman Mihail" },
  { id: 11, name: "Melnic Alexei" },
  { id: 12, name: "Melnic Dmitri" },
  { id: 13, name: "Mihalciuc Piotr" },
  { id: 14, name: "Poleacova Polina" },
  { id: 15, name: "Popovici Roman" },
  { id: 16, name: "Solomahin Alexandr" },
  { id: 17, name: "Stepanova Ecaterina" },
  { id: 18, name: "Şveţ Marius" },
  { id: 19, name: "Timofeeva Olga" },
  { id: 20, name: "Troian Vasili" },
  { id: 21, name: "Zarețkii Roman" }
];

const WEEKDAY_NAMES_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const MONTH_NAMES_GENITIVE_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

// 2. Генерация учебных дат (02.10.2026 - 31.12.2026, без сб и вс)
function generateSchoolDays() {
  const days = [];
  const start = new Date(2026, 9, 2); // 9 = Октябрь (0-indexed)
  const end = new Date(2026, 11, 31); // 11 = Декабрь

  let curr = new Date(start);
  while (curr <= end) {
    const dayOfWeek = curr.getDay();
    // Исключаем субботы (6) и воскресенья (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = curr.getFullYear();
      const month = curr.getMonth() + 1;
      const day = curr.getDate();
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push({
        iso,
        dateObj: new Date(curr),
        year,
        month,
        day,
        dayOfWeek,
        weekdayShort: WEEKDAY_NAMES_RU[dayOfWeek],
        monthName: MONTH_NAMES_RU[month - 1],
        formatted: `${day} ${MONTH_NAMES_GENITIVE_RU[month - 1]} ${year}, ${getWeekdayFull(dayOfWeek)}`
      });
    }
    curr.setDate(curr.getDate() + 1);
  }
  return days;
}

function getWeekdayFull(dayOfWeek) {
  const full = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return full[dayOfWeek] || '';
}

const SCHOOL_DAYS = generateSchoolDays();

// Определение сегодняшнего учебного дня
function getTodaySchoolDayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayIso = `${y}-${m}-${d}`;

  // Ищем точное совпадение среди учебных дней
  const match = SCHOOL_DAYS.find(day => day.iso === todayIso);
  if (match) return match.iso;

  // Если дата раньше начала периода (например 01.10.2026), берем первый учебный день (02.10.2026)
  if (todayIso < SCHOOL_DAYS[0].iso) return SCHOOL_DAYS[0].iso;

  // Если дата позже окончания периода, берем последний учебный день
  if (todayIso > SCHOOL_DAYS[SCHOOL_DAYS.length - 1].iso) return SCHOOL_DAYS[SCHOOL_DAYS.length - 1].iso;

  // Если дата внутри периода, но это суббота/воскресенье — переходим на ближайший следующий учебный день
  const nextSchoolDay = SCHOOL_DAYS.find(day => day.iso >= todayIso);
  return nextSchoolDay ? nextSchoolDay.iso : SCHOOL_DAYS[0].iso;
}

// 3. Состояние приложения
const STORAGE_KEY = 'class_a2_duty_records_v1';
const THEME_KEY = 'class_a2_theme_mode';

let appState = {
  // key: `${studentId}_${dateIso}` -> { status: 'done' | 'missed' | 'excused', note: '' }
  duties: {},
  currentMonthFilter: 'all',
  searchQuery: '',
  selectedDayIso: getTodaySchoolDayIso(),
  activeTab: 'table-view'
};

function jumpToToday() {
  const todayIso = getTodaySchoolDayIso();
  const todayDay = SCHOOL_DAYS.find(d => d.iso === todayIso) || SCHOOL_DAYS[0];

  // Если включен фильтр месяца, и сегодняшняя дата в другом месяце — переключаем на 'all' или нужный месяц
  if (appState.currentMonthFilter !== 'all' && appState.currentMonthFilter !== String(todayDay.month)) {
    appState.currentMonthFilter = String(todayDay.month);
    document.querySelectorAll('.pill-btn[data-month]').forEach(p => {
      if (p.getAttribute('data-month') === String(todayDay.month)) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  appState.selectedDayIso = todayIso;
  renderAllViews();

  // Плавная прокрутка таблицы к сегодняшнему столбцу
  setTimeout(() => {
    const th = document.querySelector(`.col-date[data-date-iso="${todayIso}"]`);
    const wrapper = document.getElementById('tableScrollWrapper');
    if (th && wrapper) {
      // 265px — ширина фиксированной колонки с именами учеников
      const targetLeft = th.offsetLeft - 265;
      wrapper.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  }, 100);

  showToast(`📍 Переход к сегодняшнему дню: ${todayDay.day} ${todayDay.monthName} (${todayDay.weekdayShort})`);
}

// Загрузка состояния из localStorage
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.duties === 'object') {
        appState.duties = parsed.duties;
      }
    }
    // Полностью очищаем любые старые служебные отметки 'assigned' (Д)
    let cleaned = false;
    Object.keys(appState.duties).forEach(key => {
      if (appState.duties[key].status === 'assigned') {
        delete appState.duties[key];
        cleaned = true;
      }
    });
    if (cleaned) {
      saveState();
    }
  } catch (e) {
    console.error('Ошибка загрузки данных из localStorage:', e);
    appState.duties = {};
  }
}

function prefillDefaultSchedule() {
  // Начинаем с абсолютно пустой и чистой таблицы без лишних отметок
  appState.duties = {};
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      duties: appState.duties,
      updatedAt: new Date().toISOString()
    }));
    updateSaveIndicator(true);
  } catch (e) {
    console.error('Ошибка сохранения данных:', e);
    updateSaveIndicator(false);
  }
  updateGlobalStats();
}

function updateSaveIndicator(success) {
  const indicator = document.getElementById('saveIndicator');
  if (!indicator) return;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  if (success) {
    indicator.innerHTML = `<span class="save-dot"></span> Автосохранение включено &bull; сохранено в ${timeStr}`;
  } else {
    indicator.innerHTML = '<span class="save-dot" style="background-color: var(--danger);"></span> Ошибка сохранения';
  }
}

// 4. Статусы дежурства:
// Порядок при клике: Дежурил (✓) -> Не дежурил (✗) -> Уважительная (—) -> Снять (пусто)
const STATUS_CYCLE = ['none', 'done', 'missed', 'excused'];

function getDutyRecord(studentId, dateIso) {
  const key = `${studentId}_${dateIso}`;
  return appState.duties[key] || { status: 'none', note: '' };
}

function setDutyRecord(studentId, dateIso, status, note = '') {
  const key = `${studentId}_${dateIso}`;
  if (status === 'none' && (!note || note.trim() === '')) {
    delete appState.duties[key];
  } else {
    appState.duties[key] = { status, note: note.trim() };
  }
  saveState();
}

function cycleCellStatus(studentId, dateIso) {
  const current = getDutyRecord(studentId, dateIso);
  const currentIndex = STATUS_CYCLE.indexOf(current.status);
  const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
  const nextStatus = STATUS_CYCLE[nextIndex];
  setDutyRecord(studentId, dateIso, nextStatus, current.note);
  renderAllViews();
  showToast(`Статус: ${getStatusTitle(nextStatus)}`);
}

function getStatusBadgeHtml(status) {
  switch (status) {
    case 'done':
      return '<span class="status-badge status-done" title="Дежурил">✓</span>';
    case 'missed':
      return '<span class="status-badge status-missed" title="Не дежурил">✗</span>';
    case 'excused':
      return '<span class="status-badge status-excused" title="Уважительная причина">—</span>';
    default:
      return '';
  }
}

function getStatusTitle(status) {
  switch (status) {
    case 'done': return 'Дежурил (✓)';
    case 'missed': return 'Не дежурил (✗)';
    case 'excused': return 'Уважительная причина (—)';
    default: return 'Без отметки';
  }
}

// 5. Рендеринг таблицы (Table View)
function renderTableView() {
  const thead = document.getElementById('dutyTableHead');
  const tbody = document.getElementById('dutyTableBody');
  if (!thead || !tbody) return;

  // Фильтр дней по месяцу
  const filteredDays = SCHOOL_DAYS.filter(day => {
    if (appState.currentMonthFilter === 'all') return true;
    return String(day.month) === appState.currentMonthFilter;
  });

  // Фильтр учеников по поисковой строке
  const search = appState.searchQuery.trim().toLowerCase();
  const filteredStudents = STUDENTS.filter(student => {
    if (!search) return true;
    return student.name.toLowerCase().includes(search);
  });

  // Строим заголовок thead (2 строки: месяцы/группы и даты)
  let headHtml = `
    <tr>
      <th rowspan="2" class="col-num">№</th>
      <th rowspan="2" class="col-student">ФИО Ученика</th>
  `;

  // Группировка дней по месяцам в заголовке
  const monthGroups = {};
  filteredDays.forEach(day => {
    monthGroups[day.monthName] = (monthGroups[day.monthName] || 0) + 1;
  });

  Object.entries(monthGroups).forEach(([mName, count]) => {
    headHtml += `<th colspan="${count}" class="month-group-th">${mName} 2026</th>`;
  });

  headHtml += `
      <th colspan="4" class="month-group-th">Итоги</th>
    </tr>
    <tr>
  `;

  const todayIso = getTodaySchoolDayIso();

  // Вторая строка thead: дни
  filteredDays.forEach(day => {
    const isFriday = day.dayOfWeek === 5 ? ' is-friday' : '';
    const isTodayCol = day.iso === todayIso ? ' is-today-column' : '';
    const isSelected = day.iso === appState.selectedDayIso ? ' is-today' : '';
    const todayBadge = day.iso === todayIso ? '<span class="today-tag">Сегодня</span>' : '';
    headHtml += `
      <th class="col-date${isFriday}${isSelected}${isTodayCol}" 
          data-date-iso="${day.iso}" 
          title="${day.formatted}${day.iso === todayIso ? ' (Текущий учебный день)' : ''}">
        ${todayBadge}
        <span class="date-day-num">${day.day}</span>
        <span class="date-weekday">${day.weekdayShort}</span>
      </th>
    `;
  });

  headHtml += `
      <th class="col-total total-done" title="Всего отдежурил">✓</th>
      <th class="col-total total-missed" title="Всего пропусков">✗</th>
      <th class="col-total" title="Уважительная причина">—</th>
      <th class="col-total total-rate" title="Процент выполнения">%</th>
    </tr>
  `;
  thead.innerHTML = headHtml;

  // Строим тело таблицы tbody
  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${filteredDays.length + 6}" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
          Ученики не найдены по запросу "${escapeHtml(appState.searchQuery)}"
        </td>
      </tr>
    `;
    return;
  }

  let bodyHtml = '';
  filteredStudents.forEach((student, index) => {
    // Подсчет статистики по ученику
    let countDone = 0;
    let countMissed = 0;
    let countExcused = 0;

    SCHOOL_DAYS.forEach(day => {
      const rec = getDutyRecord(student.id, day.iso);
      if (rec.status === 'done') countDone++;
      else if (rec.status === 'missed') countMissed++;
      else if (rec.status === 'excused') countExcused++;
    });

    const totalActive = countDone + countMissed;
    const rate = totalActive > 0 ? Math.round((countDone / totalActive) * 100) : (countDone > 0 ? 100 : 0);

    bodyHtml += `
      <tr data-student-id="${student.id}">
        <td class="col-num">${student.id}</td>
        <td class="col-student" title="${student.name}">${escapeHtml(student.name)}</td>
    `;

    filteredDays.forEach(day => {
      const rec = getDutyRecord(student.id, day.iso);
      const hasNoteClass = rec.note ? ' cell-has-note' : '';
      const isTodayCell = day.iso === todayIso ? ' is-today-cell' : '';
      const noteTooltip = rec.note ? `\nЗаметка: ${rec.note}` : '';
      const cellTooltip = `${student.name} — ${day.formatted}\nСтатус: ${getStatusTitle(rec.status)}${noteTooltip}\n(Клик: переключить, Двойной клик: окно)`;

      bodyHtml += `
        <td class="duty-cell${hasNoteClass}${isTodayCell}" 
            data-student-id="${student.id}" 
            data-date-iso="${day.iso}"
            title="${escapeHtml(cellTooltip)}">
          <div class="cell-content">
            ${getStatusBadgeHtml(rec.status)}
          </div>
        </td>
      `;
    });

    bodyHtml += `
        <td class="col-total total-done">${countDone}</td>
        <td class="col-total total-missed">${countMissed}</td>
        <td class="col-total">${countExcused}</td>
        <td class="col-total total-rate">${totalActive > 0 ? rate + '%' : '—'}</td>
      </tr>
    `;
  });

  tbody.innerHTML = bodyHtml;
  attachTableEventListeners();
}

function attachTableEventListeners() {
  const tbody = document.getElementById('dutyTableBody');
  if (!tbody) return;

  const cells = tbody.querySelectorAll('.duty-cell');
  cells.forEach(cell => {
    // Одиночный клик - быстрое циклическое переключение
    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      const studentId = parseInt(cell.getAttribute('data-student-id'), 10);
      const dateIso = cell.getAttribute('data-date-iso');
      cycleCellStatus(studentId, dateIso);
    });

    // Двойной клик или правый клик - модальное окно для выбора статуса и ввода заметки
    cell.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const studentId = parseInt(cell.getAttribute('data-student-id'), 10);
      const dateIso = cell.getAttribute('data-date-iso');
      openCellModal(studentId, dateIso);
    });

    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const studentId = parseInt(cell.getAttribute('data-student-id'), 10);
      const dateIso = cell.getAttribute('data-date-iso');
      openCellModal(studentId, dateIso);
    });
  });
}

// 6. Рендеринг Дневного режима (Day View)
function renderDayView() {
  const currentDay = SCHOOL_DAYS.find(d => d.iso === appState.selectedDayIso) || SCHOOL_DAYS[0];
  appState.selectedDayIso = currentDay.iso;

  // Обновляем шапку дня
  const datePicker = document.getElementById('dayViewDatePicker');
  const dateFormatted = document.getElementById('dayViewFormattedDate');
  const summaryPill = document.getElementById('daySummaryPill');
  if (datePicker) datePicker.value = currentDay.iso;
  if (dateFormatted) dateFormatted.textContent = currentDay.formatted;

  // Находим всех дежурных на этот день
  const assignedStudents = [];
  STUDENTS.forEach(student => {
    const rec = getDutyRecord(student.id, currentDay.iso);
    if (rec.status !== 'none') {
      assignedStudents.push({ student, record: rec });
    }
  });

  if (summaryPill) {
    summaryPill.textContent = `Отмечено на сегодня: ${assignedStudents.length}`;
  }

  // Рендерим карточки дежурных на день
  const cardsContainer = document.getElementById('dayDutyCardsList');
  if (cardsContainer) {
    if (assignedStudents.length === 0) {
      cardsContainer.innerHTML = `
        <div class="empty-day-state">
          <p>На этот день пока нет отметок о дежурствах.</p>
          <p style="margin-top: 0.5rem; font-size: 0.85rem;">
            Нажмите на статус любого ученика в списке ниже или выберите его в списке выше, чтобы отметить.
          </p>
        </div>
      `;
    } else {
      let cardsHtml = '';
      assignedStudents.forEach(({ student, record }) => {
        cardsHtml += `
          <div class="day-duty-card" data-student-id="${student.id}">
            <div class="duty-card-header">
              <span class="duty-student-name">${escapeHtml(student.name)}</span>
              ${getStatusBadgeHtml(record.status)}
            </div>
            
            <div class="duty-card-actions">
              <button class="duty-btn-action ${record.status === 'done' ? 'active-done' : ''}" 
                      title="Отметить факт дежурства" 
                      onclick="handleDayStatusChange(${student.id}, '${currentDay.iso}', 'done')">
                ✓ Дежурил
              </button>
              <button class="duty-btn-action ${record.status === 'missed' ? 'active-missed' : ''}" 
                      onclick="handleDayStatusChange(${student.id}, '${currentDay.iso}', 'missed')">
                ✗ Не явился
              </button>
              <button class="duty-btn-action ${record.status === 'excused' ? 'active-excused' : ''}" 
                      onclick="handleDayStatusChange(${student.id}, '${currentDay.iso}', 'excused')">
                — Уважит.
              </button>
              <button class="duty-btn-action" 
                      title="Редактировать заметку" 
                      onclick="openCellModal(${student.id}, '${currentDay.iso}')">
                ✏️ Заметка
              </button>
              <button class="duty-btn-action" 
                      style="color: var(--danger);" 
                      title="Убрать из списка на этот день" 
                      onclick="handleDayStatusChange(${student.id}, '${currentDay.iso}', 'none')">
                ✕ Снять
              </button>
            </div>

            ${record.note ? `<div style="font-size: 0.8rem; color: var(--text-secondary); background: var(--bg-subtle); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm);">Заметка: ${escapeHtml(record.note)}</div>` : ''}
          </div>
        `;
      });
      cardsContainer.innerHTML = cardsHtml;
    }
  }

  // Обновляем выпадающий список для быстрого добавления ученика
  const select = document.getElementById('addStudentToDaySelect');
  if (select) {
    let selectHtml = '<option value="">+ Назначить ученика на этот день...</option>';
    STUDENTS.forEach(s => {
      const isAlready = assignedStudents.some(a => a.student.id === s.id);
      selectHtml += `<option value="${s.id}" ${isAlready ? 'disabled' : ''}>${escapeHtml(s.name)} ${isAlready ? '(уже добавлен)' : ''}</option>`;
    });
    select.innerHTML = selectHtml;
  }

  // Рендерим быстрый список всех учеников класса на этот день
  const rosterGrid = document.getElementById('dayFullRosterGrid');
  if (rosterGrid) {
    let rosterHtml = '';
    STUDENTS.forEach(student => {
      const rec = getDutyRecord(student.id, currentDay.iso);
      rosterHtml += `
        <div class="roster-item">
          <span class="roster-name" title="${student.name}">${escapeHtml(student.name)}</span>
          <button class="roster-status-btn" 
                  title="Кликните для изменения статуса" 
                  onclick="cycleCellStatus(${student.id}, '${currentDay.iso}')">
            ${getStatusBadgeHtml(rec.status)}
          </button>
        </div>
      `;
    });
    rosterGrid.innerHTML = rosterHtml;
  }
}

window.handleDayStatusChange = function(studentId, dateIso, status) {
  const current = getDutyRecord(studentId, dateIso);
  // Если повторный клик по тому же статусу — снимаем отметку
  const newStatus = (current.status === status) ? 'none' : status;
  setDutyRecord(studentId, dateIso, newStatus, current.note);
  renderAllViews();
  showToast(`Статус: ${getStatusTitle(newStatus)}`);
};

// 7. Рендеринг статистики и рейтинга учеников
function renderStatsView() {
  const tbody = document.getElementById('studentsStatsTbody');
  if (!tbody) return;

  const statsList = STUDENTS.map(student => {
    let done = 0;
    let missed = 0;
    let excused = 0;
    let lastDate = null;

    SCHOOL_DAYS.forEach(day => {
      const rec = getDutyRecord(student.id, day.iso);
      if (rec.status === 'done') {
        done++;
        lastDate = day.formatted;
      } else if (rec.status === 'missed') {
        missed++;
      } else if (rec.status === 'excused') {
        excused++;
      }
    });

    const activeTotal = done + missed;
    const rate = activeTotal > 0 ? Math.round((done / activeTotal) * 100) : (done > 0 ? 100 : 0);

    return {
      student,
      done,
      missed,
      excused,
      rate,
      lastDate: lastDate || '—'
    };
  });

  // Сортировка: больше дежурств / выше рейтинг
  statsList.sort((a, b) => b.done - a.done || b.rate - a.rate || a.student.name.localeCompare(b.student.name));

  let html = '';
  statsList.forEach((item, idx) => {
    html += `
      <tr>
        <td style="font-weight: 700; color: var(--text-muted);">${idx + 1}</td>
        <td style="font-weight: 600;">${escapeHtml(item.student.name)}</td>
        <td class="text-center font-weight-bold" style="color: var(--success-text);">${item.done}</td>
        <td class="text-center" style="color: var(--danger-text);">${item.missed}</td>
        <td class="text-center">${item.excused}</td>
        <td>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600;">
            <span>${item.rate}%</span>
            <span class="text-muted">${item.done}/${item.done + item.missed}</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${item.rate}%;"></div>
          </div>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${item.lastDate}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// 8. Обновление сводных карточек в верхней панели
function updateGlobalStats() {
  let doneCount = 0;
  let missedCount = 0;

  Object.values(appState.duties).forEach(rec => {
    if (rec.status === 'done') doneCount++;
    else if (rec.status === 'missed') missedCount++;
  });

  const elStudents = document.getElementById('statStudentsCount');
  const elDays = document.getElementById('statDaysCount');
  const elDone = document.getElementById('statCompletedCount');
  const elMissed = document.getElementById('statMissedCount');

  if (elStudents) elStudents.textContent = STUDENTS.length;
  if (elDays) elDays.textContent = SCHOOL_DAYS.length;
  if (elDone) elDone.textContent = doneCount;
  if (elMissed) elMissed.textContent = missedCount;
}

function renderAllViews() {
  renderTableView();
  renderDayView();
  renderStatsView();
  updateGlobalStats();
}

// 9. Модальное окно для ячейки (Статус + заметка)
let currentModalStudentId = null;
let currentModalDateIso = null;
let currentModalSelectedStatus = 'done';

function openCellModal(studentId, dateIso) {
  const student = STUDENTS.find(s => s.id === studentId);
  const day = SCHOOL_DAYS.find(d => d.iso === dateIso);
  if (!student || !day) return;

  currentModalStudentId = studentId;
  currentModalDateIso = dateIso;

  const currentRec = getDutyRecord(studentId, dateIso);
  currentModalSelectedStatus = currentRec.status === 'none' ? 'done' : currentRec.status;

  const modal = document.getElementById('cellActionModal');
  const infoEl = document.getElementById('cellModalInfo');
  const noteInput = document.getElementById('cellNoteInput');

  if (infoEl) {
    infoEl.innerHTML = `
      <strong>Ученик:</strong> ${escapeHtml(student.name)}<br>
      <strong>Дата:</strong> ${day.formatted}
    `;
  }

  if (noteInput) {
    noteInput.value = currentRec.note || '';
  }

  updateModalStatusButtons();
  if (modal) modal.classList.add('show');
}

function closeCellModal() {
  const modal = document.getElementById('cellActionModal');
  if (modal) modal.classList.remove('show');
}

function updateModalStatusButtons() {
  const buttons = document.querySelectorAll('.status-option-btn');
  buttons.forEach(btn => {
    const status = btn.getAttribute('data-status');
    if (status === currentModalSelectedStatus) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// 10. Авто-генератор графика (Модальное окно)
function openAutoAssignModal() {
  const modal = document.getElementById('autoAssignModal');
  if (modal) modal.classList.add('show');
}

function closeAutoAssignModal() {
  const modal = document.getElementById('autoAssignModal');
  if (modal) modal.classList.remove('show');
}

function executeAutoAssign() {
  const countSelect = document.getElementById('autoAssignCountSelect');
  const orderSelect = document.getElementById('autoAssignOrderSelect');
  const scopeSelect = document.getElementById('autoAssignScopeSelect');

  const dutiesPerDay = parseInt(countSelect.value, 10) || 2;
  const order = orderSelect.value; // 'sequential' | 'random'
  const scope = scopeSelect.value; // 'all' | 'emptyOnly' | 'futureOnly'

  let studentPool = [...STUDENTS];
  if (order === 'random') {
    shuffleArray(studentPool);
  }

  let poolIndex = 0;

  SCHOOL_DAYS.forEach(day => {
    // Проверка области применения
    if (scope === 'emptyOnly') {
      const hasAny = STUDENTS.some(s => getDutyRecord(s.id, day.iso).status !== 'none');
      if (hasAny) return;
    } else if (scope === 'futureOnly') {
      if (day.iso < appState.selectedDayIso) return;
    }

    // Если режим 'all', предварительно очищаем дежурных на этот день
    if (scope === 'all') {
      STUDENTS.forEach(s => {
        delete appState.duties[`${s.id}_${day.iso}`];
      });
    }

    // Назначаем нужное количество учеников
    for (let i = 0; i < dutiesPerDay; i++) {
      const student = studentPool[poolIndex % studentPool.length];
      const key = `${student.id}_${day.iso}`;
      appState.duties[key] = {
        status: 'done',
        note: ''
      };
      poolIndex++;
    }
  });

  saveState();
  renderAllViews();
  closeAutoAssignModal();
  showToast(`График успешно сформирован (по ${dutiesPerDay} дежурных на день)`);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 11. Экспорт в CSV / Excel
function exportToCsv() {
  // UTF-8 BOM для корректного открытия русских символов в Excel
  let csvContent = '\uFEFF';
  
  // Заголовок CSV
  const headers = ['№', 'ФИО Ученика'];
  SCHOOL_DAYS.forEach(day => {
    headers.push(`${day.day}.${String(day.month).padStart(2, '0')} (${day.weekdayShort})`);
  });
  headers.push('Дежурил (✓)', 'Не дежурил (✗)', 'Уважительная (—)', '% Выполнения');
  csvContent += headers.map(h => `"${h}"`).join(';') + '\r\n';

  // Строки
  STUDENTS.forEach(student => {
    let countDone = 0;
    let countMissed = 0;
    let countExcused = 0;

    const row = [student.id, `"${student.name}"`];

    SCHOOL_DAYS.forEach(day => {
      const rec = getDutyRecord(student.id, day.iso);
      let mark = '';
      if (rec.status === 'done') { mark = '✓'; countDone++; }
      else if (rec.status === 'missed') { mark = '✗'; countMissed++; }
      else if (rec.status === 'excused') { mark = '—'; countExcused++; }
      
      if (rec.note) mark += ` (${rec.note})`;
      row.push(`"${mark}"`);
    });

    const activeTotal = countDone + countMissed;
    const rate = activeTotal > 0 ? Math.round((countDone / activeTotal) * 100) + '%' : '—';

    row.push(countDone, countMissed, countExcused, `"${rate}"`);
    csvContent += row.join(';') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Дежурство_Класс_A2_2026.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Таблица экспортирована в CSV файл');
}

// Резервная копия JSON
function backupJson() {
  const data = {
    class: 'A-2',
    startDate: '2026-10-02',
    endDate: '2026-12-31',
    exportedAt: new Date().toISOString(),
    students: STUDENTS,
    duties: appState.duties
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `duty_schedule_A2_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Резервная копия сохранена в JSON');
}

// Загрузка из JSON
function importJson(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.duties) {
        appState.duties = data.duties;
        saveState();
        renderAllViews();
        showToast('Данные успешно импортированы!');
      } else {
        alert('Неверный формат файла резервной копии.');
      }
    } catch (err) {
      alert('Ошибка чтения JSON файла.');
    }
  };
  reader.readAsText(file);
}

// Сброс данных
function resetAllData() {
  if (confirm('Вы действительно хотите полностью очистить все отметки и назначения? Это действие необратимо.')) {
    appState.duties = {};
    saveState();
    renderAllViews();
    showToast('Все отметки успешно сброшены');
  }
}

// 12. Toast уведомления
function showToast(message, type = 'normal') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''} ${type === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

// Вспомогательная функция экранирования HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 13. Инициализация и слушатели событий
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Инициализация темы оформления
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      showToast(`Тема переключена на: ${next === 'dark' ? 'тёмную' : 'светлую'}`);
    });
  }

  // Переключение вкладок (Таблица / Дневной / Статистика)
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');
      appState.activeTab = targetTab;

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const activePanel = document.getElementById(targetTab);
      if (activePanel) activePanel.classList.add('active');

      // Обновляем нужный вид
      if (targetTab === 'table-view') renderTableView();
      else if (targetTab === 'day-view') renderDayView();
      else if (targetTab === 'stats-view') renderStatsView();
    });
  });

  // Фильтр по месяцам
  const monthPills = document.querySelectorAll('.pill-btn');
  monthPills.forEach(pill => {
    pill.addEventListener('click', () => {
      monthPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.currentMonthFilter = pill.getAttribute('data-month');
      renderTableView();
    });
  });

  // Поиск по ученикам
  const searchInput = document.getElementById('studentSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = appState.searchQuery ? 'block' : 'none';
      }
      renderTableView();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        appState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderTableView();
      }
    });
  }

  // Меню Экспорта
  const exportBtn = document.getElementById('exportMenuBtn');
  const exportDropdown = document.getElementById('exportDropdown');
  if (exportBtn && exportDropdown) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      exportDropdown.classList.remove('show');
    });
  }

  document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCsv);
  document.getElementById('backupJsonBtn')?.addEventListener('click', backupJson);
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
  document.getElementById('printStatsBtn')?.addEventListener('click', () => window.print());
  document.getElementById('resetDataBtn')?.addEventListener('click', resetAllData);

  const importInput = document.getElementById('importJsonInput');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importJson(e.target.files[0]);
      }
    });
  }

  // Авто-генератор модалка
  document.getElementById('autoAssignModalBtn')?.addEventListener('click', openAutoAssignModal);
  document.getElementById('closeAutoAssignModalBtn')?.addEventListener('click', closeAutoAssignModal);
  document.getElementById('cancelAutoAssignBtn')?.addEventListener('click', closeAutoAssignModal);
  document.getElementById('confirmAutoAssignBtn')?.addEventListener('click', executeAutoAssign);

  // Модалка отметки ячейки
  document.getElementById('closeCellModalBtn')?.addEventListener('click', closeCellModal);
  document.getElementById('cancelCellModalBtn')?.addEventListener('click', closeCellModal);

  // Выбор статуса в модалке
  document.querySelectorAll('.status-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentModalSelectedStatus = btn.getAttribute('data-status');
      updateModalStatusButtons();
    });
  });

  document.getElementById('saveCellModalBtn')?.addEventListener('click', () => {
    if (currentModalStudentId && currentModalDateIso) {
      const noteInput = document.getElementById('cellNoteInput');
      const note = noteInput ? noteInput.value : '';
      setDutyRecord(currentModalStudentId, currentModalDateIso, currentModalSelectedStatus, note);
      renderAllViews();
      closeCellModal();
      showToast(`Отметка сохранена: ${getStatusTitle(currentModalSelectedStatus)}`);
    }
  });

  // Навигация в дневном режиме (Day View)
  const datePicker = document.getElementById('dayViewDatePicker');
  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      const val = e.target.value;
      const match = SCHOOL_DAYS.find(d => d.iso === val);
      if (match) {
        appState.selectedDayIso = match.iso;
      } else {
        // Если выбран выходной, переключаем на ближайший учебный день
        const nextSchoolDay = SCHOOL_DAYS.find(d => d.iso >= val) || SCHOOL_DAYS[0];
        appState.selectedDayIso = nextSchoolDay.iso;
        showToast('Выбран выходной день — переключено на учебный день');
      }
      renderDayView();
    });
  }

  document.getElementById('prevDayBtn')?.addEventListener('click', () => {
    const currentIndex = SCHOOL_DAYS.findIndex(d => d.iso === appState.selectedDayIso);
    if (currentIndex > 0) {
      appState.selectedDayIso = SCHOOL_DAYS[currentIndex - 1].iso;
      renderDayView();
    } else {
      showToast('Это первый учебный день в расписании (02.10.2026)');
    }
  });

  document.getElementById('nextDayBtn')?.addEventListener('click', () => {
    const currentIndex = SCHOOL_DAYS.findIndex(d => d.iso === appState.selectedDayIso);
    if (currentIndex < SCHOOL_DAYS.length - 1) {
      appState.selectedDayIso = SCHOOL_DAYS[currentIndex + 1].iso;
      renderDayView();
    } else {
      showToast('Это последний учебный день в расписании (31.12.2026)');
    }
  });

  // Добавление дежурного на день
  document.getElementById('addStudentToDayBtn')?.addEventListener('click', () => {
    const select = document.getElementById('addStudentToDaySelect');
    if (!select || !select.value) return;

    const studentId = parseInt(select.value, 10);
    const dateIso = appState.selectedDayIso;
    setDutyRecord(studentId, dateIso, 'done');
    renderAllViews();
    showToast('Ученик добавлен в дежурные на этот день');
  });

  // Ручное сохранение
  document.getElementById('manualSaveBtn')?.addEventListener('click', () => {
    saveState();
    showToast('Все отметки успешно сохранены в памяти браузера!');
  });

  // Очистка всех отметок
  document.getElementById('clearAllMarksBtn')?.addEventListener('click', () => {
    if (confirm('Очистить все отметки дежурств во всей таблице?')) {
      appState.duties = {};
      saveState();
      renderAllViews();
      showToast('Все отметки дежурств очищены');
    }
  });

  // Снять все отметки на выбранный день
  document.getElementById('unmarkAllTodayBtn')?.addEventListener('click', () => {
    const dateIso = appState.selectedDayIso;
    let count = 0;
    STUDENTS.forEach(student => {
      const rec = getDutyRecord(student.id, dateIso);
      if (rec.status !== 'none') {
        setDutyRecord(student.id, dateIso, 'none');
        count++;
      }
    });
    if (count > 0) {
      renderAllViews();
      showToast('Отметки за выбранный день сняты');
    } else {
      showToast('На этот день нет выставленных отметок');
    }
  });

  // Кнопка перехода к сегодняшнему дню в таблице
  document.getElementById('jumpToTodayBtn')?.addEventListener('click', jumpToToday);

  // Кнопка перехода к сегодняшнему дню в дневном режиме
  document.getElementById('dayViewTodayBtn')?.addEventListener('click', () => {
    appState.selectedDayIso = getTodaySchoolDayIso();
    renderDayView();
    const todayDay = SCHOOL_DAYS.find(d => d.iso === appState.selectedDayIso) || SCHOOL_DAYS[0];
    showToast(`📍 Выбран сегодняшний день: ${todayDay.formatted}`);
  });

  // Первоначальный рендер всех экранов
  renderAllViews();
});
