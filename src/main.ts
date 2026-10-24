import './style.css'

const API_URL = 'https://Phatne.pythonanywhere.com/api/todos/';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
}

// Bảng định nghĩa các bộ màu IT Themes
const themes: Record<string, Record<string, string>> = {
  github: {
    '--bg-main': '#0d1117',
    '--card-bg': '#161b22',
    '--border-color': '#30363d',
    '--text-main': '#c9d1d9',
    '--text-muted': '#8b949e',
    '--accent-blue': '#58a6ff',
    '--accent-green': '#2ea043',
    '--accent-red': '#f85149',
    '--accent-orange': '#d29922',
  },
  monokai: {
    '--bg-main': '#1e1e1e',
    '--card-bg': '#252526',
    '--border-color': '#333333',
    '--text-main': '#f8f8f2',
    '--text-muted': '#75715e',
    '--accent-blue': '#66d9ef',
    '--accent-green': '#a6e22e',
    '--accent-red': '#f92672',
    '--accent-orange': '#fd971f',
  },
  dracula: {
    '--bg-main': '#282a36',
    '--card-bg': '#1e1f29',
    '--border-color': '#44475a',
    '--text-main': '#f8f8f2',
    '--text-muted': '#6272a4',
    '--accent-blue': '#8be9fd',
    '--accent-green': '#50fa7b',
    '--accent-red': '#ff5555',
    '--accent-orange': '#ffb86c',
  },
  matrix: {
    '--bg-main': '#050505',
    '--card-bg': '#0f140f',
    '--border-color': '#1b3b1b',
    '--text-main': '#00ff66',
    '--text-muted': '#388e3c',
    '--accent-blue': '#00e5ff',
    '--accent-green': '#00ff66',
    '--accent-red': '#ff1744',
    '--accent-orange': '#ffea00',
  }
};

function applyTheme(themeName: string) {
  const selectedTheme = themes[themeName] || themes['github'];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(selectedTheme)) {
    root.style.setProperty(key, value);
  }
  localStorage.setItem('appTheme', themeName);
}

const savedTheme = localStorage.getItem('appTheme') || 'github';
applyTheme(savedTheme);

function renderLayout() {
  const appTitle = localStorage.getItem('appTitle') || 'IT_Dashboard // Todo-Manager';
  const currentTheme = localStorage.getItem('appTheme') || 'github';

  return `
    <div class="app-container">
      <nav class="navbar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div class="nav-links">
          <a href="#/" class="nav-link">🏠 ~/home</a>
          <a href="#/about" class="nav-link">ℹ️ ~/about</a>
          <a href="#/admin" class="nav-link" style="color: var(--accent-red);">🔒 ~/admin-panel</a>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <select id="theme-selector" class="custom-input" style="padding: 4px 8px; font-size: 12px; font-family: var(--font-mono); cursor: pointer;">
            <option value="github" ${currentTheme === 'github' ? 'selected' : ''}>🐙 GitHub Dark</option>
            <option value="monokai" ${currentTheme === 'monokai' ? 'selected' : ''}>💻 VS Code Monokai</option>
            <option value="dracula" ${currentTheme === 'dracula' ? 'selected' : ''}>🧛 Dracula Theme</option>
            <option value="matrix" ${currentTheme === 'matrix' ? 'selected' : ''}>🟢 Matrix Green</option>
          </select>
          <div id="auth-status"></div>
        </div>
      </nav>

      <div class="card-box">
        <h2 id="main-title" style="margin-top: 0; color: var(--accent-blue); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
          ⚡ ${appTitle}
        </h2>
        <div id="page-content"></div>
      </div>
    </div>
  `;
}

function updateAuthUI() {
  const authEl = document.querySelector('#auth-status');
  if (!authEl) return;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    authEl.innerHTML = `
      <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-green); margin-right: 8px;">[ROOT]</span>
      <button id="logout-btn" class="del-btn" style="padding: 4px 8px; font-size: 11px;">Logout</button>
    `;
    document.querySelector('#logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('accessToken');
      window.location.hash = '#/';
      router();
    });
  } else {
    authEl.innerHTML = `<span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">[GUEST]</span>`;
  }
}

async function renderHomePage() {
  const isMaintenance = localStorage.getItem('maintenanceMode') === 'true';
  const contentEl = document.querySelector('#page-content');
  if (!contentEl) return;

  if (isMaintenance) {
    contentEl.innerHTML = `
      <div style="padding: 20px; background: rgba(210, 153, 34, 0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); border-radius: 6px; font-family: var(--font-mono);">
        <h3>⚠️ SYSTEM_MAINTENANCE_MODE</h3>
        <p>Hệ thống đang được bảo trì bởi Quản trị viên. Vui lòng quay lại sau.</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = `
    <p style="color: var(--text-muted); font-size: 14px;">Quản lý công việc thông minh kèm mức độ ưu tiên & hạn chót.</p>
    
    <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <div style="margin-bottom: 10px;">
        <input type="text" id="todo-input" class="custom-input" placeholder="Nhập tên công việc mới..." style="width: 100%; box-sizing: border-box;" />
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1; min-width: 140px;">
          <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px; font-family: var(--font-mono);">PRIORITY:</label>
          <select id="priority-input" class="custom-input" style="width: 100%; padding: 8px;">
            <option value="low">🟢 Thấp (Low)</option>
            <option value="medium" selected>🟡 Trung bình (Med)</option>
            <option value="high">🔴 Cao (High)</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 140px;">
          <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px; font-family: var(--font-mono);">DUE DATE:</label>
          <input type="date" id="date-input" class="custom-input" style="width: 100%; padding: 7px; box-sizing: border-box;" />
        </div>
        <div style="align-self: flex-end; width: 100%;">
          <button id="add-btn" class="btn-primary" style="width: 100%; padding: 10px 20px; margin-top: 4px;">+ Add Task</button>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
      <input type="text" id="search-input" class="custom-input" placeholder="🔍 Tìm kiếm task..." style="flex: 1; min-width: 200px;" />
      <div style="display: flex; gap: 6px;">
        <button class="filter-btn tab-btn" data-filter="all" style="background: var(--accent-blue); color: white;">All</button>
        <button class="filter-btn tab-btn" data-filter="pending">Pending</button>
        <button class="filter-btn tab-btn" data-filter="completed">Done</button>
      </div>
    </div>

    <ul id="todo-list" style="padding-left: 0; list-style: none;"><li>Đang kết nối API...</li></ul>
  `;

  let allTodos: Todo[] = [];
  let currentFilter = 'all';
  let searchQuery = '';

  const renderList = () => {
    const listEl = document.querySelector('#todo-list');
    if (!listEl) return;
    
    const filtered = allTodos.filter(t => {
      const matchTitle = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (currentFilter === 'pending') return matchTitle && !t.completed;
      if (currentFilter === 'completed') return matchTitle && t.completed;
      return matchTitle;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<li style="color: var(--text-muted); padding: 12px; text-align: center;">Không tìm thấy công việc phù hợp.</li>';
      return;
    }

    listEl.innerHTML = filtered.map(t => {
      let priorityBadge = '';
      if (t.priority === 'high') priorityBadge = '<span style="color: var(--accent-red); font-size: 11px; border: 1px solid var(--accent-red); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">HIGH</span>';
      else if (t.priority === 'medium') priorityBadge = '<span style="color: var(--accent-orange); font-size: 11px; border: 1px solid var(--accent-orange); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">MED</span>';
      else priorityBadge = '<span style="color: var(--accent-green); font-size: 11px; border: 1px solid var(--accent-green); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">LOW</span>';

      const dateText = t.due_date ? `📅 ${t.due_date}` : '';

      return `
        <li class="task-item" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div style="flex: 1; display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <span class="toggle-home-status" data-id="${t.id}" style="cursor: pointer; ${t.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}" title="Bấm để đổi trạng thái">
              ${t.title}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            ${priorityBadge}
            <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${dateText}</span>
            <span style="font-family: var(--font-mono); font-size: 13px;">${t.completed ? '🟢 [DONE]' : '⏳ [PENDING]'}</span>
          </div>
        </li>
      `;
    }).join('');

    document.querySelectorAll('.toggle-home-status').forEach(item => {
      item.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const targetTodo = allTodos.find(t => t.id.toString() === id);
        if (!targetTodo) return;

        await fetch(`${API_URL}${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !targetTodo.completed })
        });
        await fetchTodosAndRender();
      });
    });
  };
  // Định nghĩa kiểu dữ liệu cho Todo
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority?: string;
  due_date?: string;
}

// Hàm tải danh sách công việc từ Django Backend
async function fetchTodos() {
  try {
    const response = await fetch('https://Phatne.pythonanywhere.com/api');
    
    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Xử lý dữ liệu trả về (hỗ trợ cả dạng mảng trực tiếp hoặc phân trang)
    const todos: Todo[] = Array.isArray(data) ? data : (data.results || []);
    
    // Gọi hàm render để hiển thị danh sách lên giao diện của bạn
    renderTodoList(todos);
    
  } catch (error) {
    console.error('Không thể kết nối tới Backend:', error);
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '<p class="text-red-500">Lỗi tải danh sách quản lý.</p>';
    }
  }
}

// Hàm mẫu để hiển thị danh sách ra HTML (tùy thuộc vào giao diện hiện tại của bạn)
function renderTodoList(todos: Todo[]) {
  console.log("Danh sách todos nhận được từ Django:", todos);
  // Thêm logic hiển thị HTML của bạn tại đây
}

// Tự động gọi hàm fetch khi trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {
  fetchTodos();
});

  const fetchTodosAndRender = async () => {
    try {
      const res = await fetch(API_URL);
      allTodos = await res.json();
      renderList();
    } catch {
      const listEl = document.querySelector('#todo-list');
      if (listEl) listEl.innerHTML = '<li style="color: var(--accent-red);">Lỗi: Không thể kết nối tới Backend Django Server!</li>';
    }
  };

  document.querySelector('#search-input')?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderList();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        (b as HTMLElement).style.background = 'var(--card-bg)';
        (b as HTMLElement).style.color = 'var(--text-main)';
      });
      const currentBtn = e.currentTarget as HTMLElement;
      currentBtn.style.background = 'var(--accent-blue)';
      currentBtn.style.color = 'white';
      
      currentFilter = currentBtn.getAttribute('data-filter') || 'all';
      renderList();
    });
  });

  document.querySelector('#add-btn')?.addEventListener('click', async () => {
    const titleInput = document.querySelector('#todo-input') as HTMLInputElement;
    const priorityInput = document.querySelector('#priority-input') as HTMLSelectElement;
    const dateInput = document.querySelector('#date-input') as HTMLInputElement;

    const title = titleInput.value.trim();
    if (!title) {
      alert('Vui lòng nhập tên công việc!');
      return;
    }

    const payload: any = {
      title: title,
      completed: false,
      priority: priorityInput.value,
    };

    if (dateInput.value) {
      payload.due_date = dateInput.value;
    }

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    titleInput.value = '';
    dateInput.value = '';
    await fetchTodosAndRender();
  });

  await fetchTodosAndRender();
}

function renderAboutPage() {
  const contentEl = document.querySelector('#page-content');
  if (!contentEl) return;
  contentEl.innerHTML = `
    <h3 style="font-family: var(--font-mono);">// System Architecture</h3>
    <p style="color: var(--text-muted);">Ứng dụng SPA (Single Page Application) sử dụng:</p>
    <ul style="font-family: var(--font-mono); font-size: 14px; color: var(--accent-blue);">
      <li>Backend: Python / Django REST Framework</li>
      <li>Frontend: Vite + TypeScript (SPA Client Router)</li>
      <li>Database: SQLite</li>
    </ul>
  `;
}

async function renderAdminPage() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const contentEl = document.querySelector('#page-content');
  if (!contentEl) return;

  if (!isLoggedIn) {
    contentEl.innerHTML = `
      <div style="max-width: 400px; margin: 20px auto; text-align: center;">
        <h3 style="color: var(--accent-red);">🔒 Authentication Required</h3>
        <p style="color: var(--text-muted); font-size: 13px;">Nhập thông tin xác thực quản trị viên (JWT) để tiếp tục.</p>
        <input type="text" id="username" class="custom-input" placeholder="Username (admin)" style="margin-bottom: 12px; width: 100%; box-sizing: border-box;" /><br/>
        <input type="password" id="password" class="custom-input" placeholder="Password" style="margin-bottom: 16px; width: 100%; box-sizing: border-box;" /><br/>
        <button id="login-btn" class="btn-primary" style="width: 100%;">Authenticate (JWT)</button>
      </div>
    `;

    document.querySelector('#login-btn')?.addEventListener('click', async () => {
      const u = (document.querySelector('#username') as HTMLInputElement).value;
      const p = (document.querySelector('#password') as HTMLInputElement).value;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('isLoggedIn', 'true');
          alert('Xác thực JWT thành công!');
          router();
        } else {
          alert('Access Denied: Tài khoản hoặc mật khẩu không chính xác!');
        }
      } catch {
        alert('Lỗi kết nối đến máy chủ xác thực.');
      }
    });
    return;
  }

 // Khung chứa các nút chuyển tab Admin
  contentEl.innerHTML = `
    <div class="admin-tabs" style="margin-bottom: 16px; display: flex; gap: 8px;">
      <button id="tab-stats" class="tab-btn">📊 Statistics</button>
      <button id="tab-manage" class="tab-btn">📝 Task Management</button>
      <button id="tab-config" class="tab-btn">⚙️ Configurations</button>
    </div>
    <div id="admin-tab-content">Loading...</div>
  `;

  // 1. Tab Thống kê (Statistics)
  const loadStats = async () => {
    const tabEl = document.querySelector('#admin-tab-content');
    if (!tabEl) return;
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const todos: Todo[] = Array.isArray(data) ? data : (data.results || []);
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const pending = total - completed;
      const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      tabEl.innerHTML = `
        <h4 style="font-family: var(--font-mono);">// System Resource & Task Metrics</h4>
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 16px; border-radius: 6px; margin-bottom: 20px; font-family: var(--font-mono);">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span>COMPLETION_RATE:</span>
            <span style="color: var(--accent-green);">${percent}%</span>
          </div>
          <div style="width: 100%; background: var(--border-color); height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="width: ${percent}%; background: var(--accent-green); height: 100%; transition: width 0.4s ease;"></div>
          </div>
        </div>
        <ul style="font-family: var(--font-mono); line-height: 2; list-style: none; padding-left: 0;">
          <li>📌 Total Tasks Processed: <strong style="color: var(--accent-blue);">${total}</strong></li>
          <li>✅ Completed Tasks: <strong style="color: var(--accent-green);">${completed}</strong></li>
          <li>⏳ Pending Tasks: <strong style="color: var(--accent-orange);">${pending}</strong></li>
          <li>🚨 High Priority Pending: <strong style="color: var(--accent-red);">${highPriority}</strong></li>
        </ul>
      `;
    } catch {
      tabEl.innerHTML = '<span style="color: var(--accent-red);">Lỗi kết nối API lấy dữ liệu thống kê.</span>';
    }
  };

  // 2. Tab Quản lý Task (Task Management)
  const loadManage = async () => {
    const tabEl = document.querySelector('#admin-tab-content');
    if (!tabEl) return;
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const todos: Todo[] = Array.isArray(data) ? data : (data.results || []);
      
      if (todos.length === 0) {
        tabEl.innerHTML = '<p style="color: var(--text-muted);">Không có bản ghi nào trong cơ sở dữ liệu.</p>';
        return;
      }

      tabEl.innerHTML = `
        <h4 style="font-family: var(--font-mono);">Database Records:</h4>
        <ul style="padding-left: 0; list-style: none; max-height: 350px; overflow-y: auto;">
          ${todos.map(t => `
            <li class="task-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 6px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px;">
              <span class="toggle-task" data-id="${t.id}" style="cursor: pointer; flex: 1; ${t.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">
                ${t.title} [${t.priority ? t.priority.toUpperCase() : 'MED'}] ${t.completed ? '🟢' : '⏳'}
              </span>
              <button class="del-btn" data-id="${t.id}" style="background: var(--accent-red); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Delete</button>
            </li>
          `).join('')}
        </ul>
      `;

      // Gắn sự kiện click đổi trạng thái hoàn thành (Toggle complete)
      document.querySelectorAll('.toggle-task').forEach(item => {
        item.addEventListener('click', async (e) => {
          const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
          const currentTodo = todos.find(t => t.id.toString() === id);
          if (!currentTodo) return;

          await fetch(`${API_URL}${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !currentTodo.completed })
          });
          loadManage();
        });
      });

      // Gắn sự kiện xóa task (Delete)
      document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = (e.target as HTMLElement).getAttribute('data-id');
          if (confirm('Xác nhận xóa bản ghi này khỏi Database?')) {
            await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
            loadManage();
          }
        });
      });
    } catch {
      tabEl.innerHTML = '<span style="color: var(--accent-red);">Lỗi tải danh sách quản lý.</span>';
    }
  };

  // 3. Tab Cấu hình hệ thống (Configurations)
  const loadConfig = () => {
    const tabEl = document.querySelector('#admin-tab-content');
    if (!tabEl) return;
    const isMaintenance = localStorage.getItem('maintenanceMode') === 'true';
    const currentTitle = localStorage.getItem('appTitle') || 'IT_Dashboard // Todo-Manager';

    tabEl.innerHTML = `
      <h4 style="font-family: var(--font-mono);">System Settings:</h4>
      <div style="margin-bottom: 16px;">
        <label style="font-size: 13px; color: var(--text-muted);">Application Title:</label><br/>
        <input type="text" id="title-input" class="custom-input" value="${currentTitle}" style="margin-top: 6px; width: 80%;" />
        <button id="save-title-btn" class="btn-primary" style="padding: 10px; margin-left: 6px;">Save</button>
      </div>
      <div>
        <label style="cursor: pointer; font-family: var(--font-mono); font-size: 14px;">
          <input type="checkbox" id="maintenance-check" ${isMaintenance ? 'checked' : ''} />
          Enable Maintenance Mode
        </label>
      </div>
    `;

    // Sự kiện lưu tiêu đề mới
    document.querySelector('#save-title-btn')?.addEventListener('click', () => {
      const titleInput = document.querySelector('#title-input') as HTMLInputElement;
      if (titleInput && titleInput.value.trim()) {
        localStorage.setItem('appTitle', titleInput.value.trim());
        alert('Đã lưu tiêu đề ứng dụng! Trang sẽ được làm mới.');
        window.location.reload();
      }
    });

    // Sự kiện bật/tắt bảo trì
    document.querySelector('#maintenance-check')?.addEventListener('change', (e) => {
      const isChecked = (e.target as HTMLInputElement).checked;
      localStorage.setItem('maintenanceMode', isChecked.toString());
      alert(isChecked ? 'Đã bật chế độ bảo trì!' : 'Đã tắt chế độ bảo trì!');
    });
  };

  // 4. Lắng nghe sự kiện chuyển qua lại giữa các Tab
  document.querySelector('#tab-stats')?.addEventListener('click', loadStats);
  document.querySelector('#tab-manage')?.addEventListener('click', loadManage);
  document.querySelector('#tab-config')?.addEventListener('click', loadConfig);

  // Mặc định load tab Statistics ngay khi mở trang Admin
  loadStats();
}

function router() {
  const hash = window.location.hash || '#/about';
  if (hash === '#/about') renderAboutPage();
  else if (hash === '#/admin') renderAdminPage();
  else renderHomePage();
  
  updateAuthUI();

  const themeSelector = document.querySelector('#theme-selector') as HTMLSelectElement;
  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      const selectedTheme = (e.target as HTMLSelectElement).value;
      applyTheme(selectedTheme);
    });
  }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
  appDiv.innerHTML = renderLayout();
}
window.addEventListener('hashchange', router);
window.addEventListener('load', router);