import './style.css';

const API_URL = 'https://my-portfolio-fullstack-a2m8.onrender.com/api'; // Render backend live API

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
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

// Toast notification system
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  let toastContainer = document.querySelector('#toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Hiệu ứng pháo hoa mini kỷ niệm khi hoàn thành công việc
function fireMiniConfetti(x: number, y: number) {
  const colors = ['#58a6ff', '#2ea043', '#f85149', '#d29922', '#a371f7'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 65 + 20;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity;
    el.style.setProperty('--dx', `${destX}px`);
    el.style.setProperty('--dy', `${destY}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }
}

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

// Định dạng ngày thông minh
function formatDueDate(dueDateStr?: string | null) {
  if (!dueDateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  if (dueDateStr < today) {
    return `<span class="due-badge due-overdue" title="Đã quá hạn!">🚨 QUÁ HẠN: ${dueDateStr}</span>`;
  }
  if (dueDateStr === today) {
    return `<span class="due-badge due-today" title="Hôm nay là hạn chót!">⏰ HÔM NAY</span>`;
  }
  return `<span class="due-badge due-future">📅 ${dueDateStr}</span>`;
}

// Tự động đăng nhập tài khoản demo khi mở từ trang Portfolio
async function autoLoginDemo() {
  if (!localStorage.getItem('accessToken')) {
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'demo',
          password: 'demo123456'
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('isLoggedIn', 'true');
          showToast('Đã kết nối tài khoản Demo trực tiếp Render Backend!', 'success');
        }
      }
    } catch (err) {
      console.warn('Lỗi auto-login demo:', err);
    }
  }
}
autoLoginDemo();

function renderLayout() {
  const appTitle = localStorage.getItem('appTitle') || 'IT_Dashboard // Todo-Manager';
  const currentTheme = localStorage.getItem('appTheme') || 'github';

  return `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-links">
          <a href="#/" class="nav-link">🏠 Home</a>
          <a href="#/about" class="nav-link">ℹ️ About</a>
          <a href="#/admin" class="nav-link" style="color: var(--accent-red);">🔒 Admin</a>
        </div>
        <div class="nav-right">
          <select id="theme-selector" class="custom-input" style="padding: 5px 8px; font-size: 11.5px; font-family: var(--font-mono); cursor: pointer;">
            <option value="github" ${currentTheme === 'github' ? 'selected' : ''}>🐙 GitHub</option>
            <option value="monokai" ${currentTheme === 'monokai' ? 'selected' : ''}>💻 Monokai</option>
            <option value="dracula" ${currentTheme === 'dracula' ? 'selected' : ''}>🧛 Dracula</option>
            <option value="matrix" ${currentTheme === 'matrix' ? 'selected' : ''}>🟢 Matrix</option>
          </select>
          <div id="auth-status"></div>
        </div>
      </nav>

      <div class="card-box">
        <div class="header-title-row">
          <h2 id="main-title" style="margin: 0; color: var(--accent-blue); font-size: 1.45rem;">
            ⚡ ${appTitle}
          </h2>
          <span class="cloud-badge">
            ● RENDER LIVE
          </span>
        </div>
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
      <span style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-green); margin-right: 4px;">[ROOT]</span>
      <button id="logout-btn" class="del-btn" style="padding: 3px 6px; font-size: 10.5px;">Logout</button>
    `;
    document.querySelector('#logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('accessToken');
      showToast('Đã đăng xuất phiên làm việc!', 'info');
      window.location.hash = '#/';
      router();
    });
  } else {
    authEl.innerHTML = `
      <button id="quick-demo-btn" class="btn-primary" style="padding: 3px 8px; font-size: 11px; background: rgba(88, 166, 255, 0.2); border: 1px solid var(--accent-blue); color: var(--accent-blue);">
        🔑 Demo
      </button>
    `;
    document.querySelector('#quick-demo-btn')?.addEventListener('click', async () => {
      await autoLoginDemo();
      router();
    });
  }
}

async function renderHomePage() {
  const isMaintenance = localStorage.getItem('maintenanceMode') === 'true';
  const contentEl = document.querySelector('#page-content');
  if (!contentEl) return;

  if (isMaintenance) {
    contentEl.innerHTML = `
      <div style="padding: 24px; background: rgba(210, 153, 34, 0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); border-radius: 8px; font-family: var(--font-mono); text-align: center;">
        <h3>⚠️ SYSTEM_MAINTENANCE_MODE</h3>
        <p>Hệ thống đang được bảo trì bởi Quản trị viên. Vui lòng quay lại sau.</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = `
    <!-- 1. Live Metrics Dashboard -->
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">TỔNG TASK</span>
        <span class="metric-val text-blue" id="metric-total">0</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">ĐÃ XONG</span>
        <span class="metric-val text-green" id="metric-completed">0</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">ĐANG CHỜ</span>
        <span class="metric-val text-orange" id="metric-pending">0</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">ƯU TIÊN CAO</span>
        <span class="metric-val text-red" id="metric-high">0</span>
      </div>
    </div>
    <div class="progress-bar-container" title="Tiến độ hoàn thành công việc">
      <div class="progress-bar-fill" id="metric-progress-fill" style="width: 0%;"></div>
    </div>

    <!-- 2. Thêm Task Mới (Responsive) -->
    <div class="add-task-card">
      <div>
        <input type="text" id="todo-input" class="custom-input" placeholder="💡 Nhập tiêu đề công việc..." />
      </div>
      <div class="input-controls-row">
        <div class="control-col">
          <label class="control-label">MỨC ƯU TIÊN:</label>
          <select id="priority-input" class="custom-input" style="padding: 8px 10px;">
            <option value="low">🟢 Thấp (Low)</option>
            <option value="medium" selected>🟡 Trung bình (Med)</option>
            <option value="high">🔴 Cao (High)</option>
          </select>
        </div>
        <div class="control-col">
          <label class="control-label">HẠN CHÓT:</label>
          <input type="date" id="date-input" class="custom-input" style="padding: 7px 10px;" />
        </div>
        <div class="control-col-btn">
          <button id="add-btn" class="btn-primary add-submit-btn">
            + Thêm Task
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Thanh Thao Tác Nhanh (Batch Actions) -->
    <div class="batch-bar">
      <button id="btn-batch-complete" class="batch-btn" title="Đánh dấu tất cả công việc đã hoàn thành">
        ✓ Hoàn thành tất cả
      </button>
      <button id="btn-batch-clear-done" class="batch-btn" title="Xóa toàn bộ task đã hoàn thành">
        🧹 Dọn task đã xong
      </button>
      <button id="btn-batch-refresh" class="batch-btn" title="Đồng bộ lại từ máy chủ Render">
        🔄 Làm mới dữ liệu
      </button>
    </div>

    <!-- 4. Bộ Lọc & Tìm Kiếm & Sắp Xếp (Responsive) -->
    <div class="filter-search-container">
      <input type="text" id="search-input" class="custom-input search-input-field" placeholder="🔍 Tìm kiếm công việc..." />
      
      <div class="filter-sort-row">
        <div class="filter-chips-group">
          <button class="filter-btn tab-btn active" data-filter="all">Tất cả</button>
          <button class="filter-btn tab-btn" data-filter="pending">Đang chờ</button>
          <button class="filter-btn tab-btn" data-filter="completed">Đã xong</button>
          <button class="filter-btn tab-btn" data-filter="high">🔴 Ưu tiên</button>
        </div>

        <select id="sort-select" class="custom-input sort-dropdown">
          <option value="newest">🕒 Mới nhất</option>
          <option value="oldest">⏳ Cũ nhất</option>
          <option value="priority">🔥 Ưu tiên</option>
          <option value="duedate">📅 Hạn chót</option>
        </select>
      </div>
    </div>

    <!-- 5. Danh Sách Công Việc -->
    <ul id="todo-list" style="padding-left: 0; list-style: none; margin: 0;">
      <li style="color: var(--text-muted); padding: 16px; text-align: center; font-family: var(--font-mono);">
        ⚡ Đang tải dữ liệu từ máy chủ Render...
      </li>
    </ul>
  `;

  let allTodos: Todo[] = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let currentSort = 'newest';

  const updateMetrics = () => {
    const total = allTodos.length;
    const completed = allTodos.filter(t => t.completed).length;
    const pending = total - completed;
    const high = allTodos.filter(t => t.priority === 'high' && !t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const elTotal = document.querySelector('#metric-total');
    const elCompleted = document.querySelector('#metric-completed');
    const elPending = document.querySelector('#metric-pending');
    const elHigh = document.querySelector('#metric-high');
    const elFill = document.querySelector('#metric-progress-fill') as HTMLElement;

    if (elTotal) elTotal.textContent = total.toString();
    if (elCompleted) elCompleted.textContent = completed.toString();
    if (elPending) elPending.textContent = pending.toString();
    if (elHigh) elHigh.textContent = high.toString();
    if (elFill) elFill.style.width = `${percent}%`;
  };

  const renderList = () => {
    const listEl = document.querySelector('#todo-list');
    if (!listEl) return;

    let filtered = (Array.isArray(allTodos) ? allTodos : []).filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (currentFilter === 'pending') return matchTitle && !t.completed;
      if (currentFilter === 'completed') return matchTitle && t.completed;
      if (currentFilter === 'high') return matchTitle && t.priority === 'high';
      return matchTitle;
    });

    // Sắp xếp
    if (currentSort === 'newest') {
      filtered = filtered.sort((a, b) => b.id - a.id);
    } else if (currentSort === 'oldest') {
      filtered = filtered.sort((a, b) => a.id - b.id);
    } else if (currentSort === 'priority') {
      const weights = { high: 3, medium: 2, low: 1 };
      filtered = filtered.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    } else if (currentSort === 'duedate') {
      filtered = filtered.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <li style="color: var(--text-muted); padding: 22px 14px; text-align: center; font-family: var(--font-mono); background: var(--bg-main); border: 1px dashed var(--border-color); border-radius: 8px; font-size: 13px;">
          ✨ Không có công việc nào phù hợp với bộ lọc hiện tại.
        </li>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(t => {
      let priorityBadge = '';
      if (t.priority === 'high') {
        priorityBadge = '<span class="badge-high" style="color: var(--accent-red); font-size: 10px; border: 1px solid var(--accent-red); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); font-weight: 700;">HIGH</span>';
      } else if (t.priority === 'medium') {
        priorityBadge = '<span style="color: var(--accent-orange); font-size: 10px; border: 1px solid var(--accent-orange); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono);">MED</span>';
      } else {
        priorityBadge = '<span style="color: var(--accent-green); font-size: 10px; border: 1px solid var(--accent-green); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono);">LOW</span>';
      }

      const dueBadge = formatDueDate(t.due_date);

      return `
        <li class="task-item ${t.completed ? 'is-completed' : ''}" data-task-id="${t.id}">
          <div class="task-main-row">
            <!-- 1. Cột Checkbox -->
            <div class="task-check-wrap">
              <div class="task-checkbox ${t.completed ? 'checked' : ''}" data-id="${t.id}" title="${t.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}"></div>
            </div>

            <!-- 2. Cột Tiêu đề & Badges (Tự động xuống dòng mềm mại trên mobile) -->
            <div class="task-content">
              <div class="task-title-text" data-id="${t.id}" style="${t.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}" title="Nhấn để đổi trạng thái">
                ${t.title}
              </div>
              <div class="task-meta-row">
                ${priorityBadge}
                ${dueBadge}
              </div>
            </div>

            <!-- 3. Cột Nút Thao tác -->
            <div class="task-actions">
              <button class="action-icon-btn btn-edit" data-id="${t.id}" title="Chỉnh sửa tên công việc">✏️</button>
              <button class="action-icon-btn btn-delete" data-id="${t.id}" title="Xóa công việc này">🗑️</button>
            </div>
          </div>
        </li>
      `;
    }).join('');

    // Toggle Task Status (Checkbox hoặc Title click)
    const handleToggle = async (id: string, e?: MouseEvent) => {
      const targetTodo = allTodos.find(t => t.id.toString() === id);
      if (!targetTodo) return;

      const nextCompleted = !targetTodo.completed;
      if (nextCompleted && e && e.clientX) {
        fireMiniConfetti(e.clientX, e.clientY);
      }

      // Cập nhật Optimistic ngay trên UI
      targetTodo.completed = nextCompleted;
      renderList();
      updateMetrics();

      try {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/todos/${id}/`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ completed: nextCompleted })
        });
        if (res.ok) {
          showToast(nextCompleted ? '🎉 Đã hoàn thành công việc!' : 'Đã chuyển về trạng thái đang chờ!', 'success');
        }
      } catch (err) {
        console.error('Lỗi toggle:', err);
        showToast('Lỗi cập nhật máy chủ, đang phục hồi lại...', 'error');
        await fetchTodosAndRender();
      }
    };

    document.querySelectorAll('.task-checkbox').forEach(box => {
      box.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) handleToggle(id, e as MouseEvent);
      });
    });

    document.querySelectorAll('.task-title-text').forEach(titleEl => {
      titleEl.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) handleToggle(id, e as MouseEvent);
      });
    });

    // Edit Task
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const targetTodo = allTodos.find(t => t.id.toString() === id);
        if (!targetTodo || !id) return;

        const newTitle = prompt('Nhập tiêu đề mới cho công việc:', targetTodo.title);
        if (!newTitle || newTitle.trim() === '' || newTitle === targetTodo.title) return;

        targetTodo.title = newTitle.trim();
        renderList();

        try {
          const token = localStorage.getItem('accessToken');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${API_URL}/todos/${id}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ title: newTitle.trim() })
          });
          if (res.ok) {
            showToast('Đã đổi tên công việc thành công!', 'success');
          }
        } catch {
          showToast('Lỗi khi sửa tiêu đề.', 'error');
          await fetchTodosAndRender();
        }
      });
    });

    // Delete Task
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (!id) return;

        if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;

        // Optimistic delete
        allTodos = allTodos.filter(t => t.id.toString() !== id);
        renderList();
        updateMetrics();

        try {
          const token = localStorage.getItem('accessToken');
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${API_URL}/todos/${id}/`, {
            method: 'DELETE',
            headers
          });
          if (res.ok || res.status === 204) {
            showToast('Đã xóa công việc khỏi Database!', 'info');
          }
        } catch {
          showToast('Lỗi khi xóa công việc.', 'error');
          await fetchTodosAndRender();
        }
      });
    });
  };

  const fetchTodosAndRender = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/todos/`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data = await res.json();
      allTodos = Array.isArray(data) ? data : (data.results || []);
      renderList();
      updateMetrics();

    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
      const listEl = document.querySelector('#todo-list');
      if (listEl) {
        listEl.innerHTML = `
          <li style="color: var(--accent-red); padding: 18px; text-align: center; background: rgba(248, 81, 73, 0.1); border: 1px solid var(--accent-red); border-radius: 6px; font-size: 13px;">
            ⚠️ Không thể kết nối tới cơ sở dữ liệu Render. Đang khởi động lại dịch vụ...
          </li>
        `;
      }
    }
  };

  // Search input
  document.querySelector('#search-input')?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderList();
  });

  // Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      const currentBtn = e.currentTarget as HTMLElement;
      currentBtn.classList.add('active');
      currentFilter = currentBtn.getAttribute('data-filter') || 'all';
      renderList();
    });
  });

  // Sort Select
  document.querySelector('#sort-select')?.addEventListener('change', (e) => {
    currentSort = (e.target as HTMLSelectElement).value;
    renderList();
  });

  // Thêm Task mới
  const handleAddTask = async () => {
    const titleInput = document.querySelector('#todo-input') as HTMLInputElement;
    const priorityInput = document.querySelector('#priority-input') as HTMLSelectElement;
    const dateInput = document.querySelector('#date-input') as HTMLInputElement;

    const title = titleInput.value.trim();
    if (!title) {
      showToast('Vui lòng nhập tên công việc!', 'error');
      titleInput.focus();
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

    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/todos/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      titleInput.value = '';
      dateInput.value = '';
      showToast('Đã thêm công việc mới vào Database!', 'success');
      await fetchTodosAndRender();
    } catch (error) {
      console.error("Lỗi khi thêm task:", error);
      showToast('Thêm công việc thất bại. Đang thử lại token...', 'error');
      await autoLoginDemo();
    }
  };

  document.querySelector('#add-btn')?.addEventListener('click', handleAddTask);
  document.querySelector('#todo-input')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') handleAddTask();
  });

  // Batch Action 1: Hoàn thành tất cả
  document.querySelector('#btn-batch-complete')?.addEventListener('click', async () => {
    const pendingTodos = allTodos.filter(t => !t.completed);
    if (pendingTodos.length === 0) {
      showToast('Tất cả công việc đã hoàn thành rồi!', 'info');
      return;
    }

    allTodos.forEach(t => t.completed = true);
    renderList();
    updateMetrics();

    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    for (const todo of pendingTodos) {
      try {
        await fetch(`${API_URL}/todos/${todo.id}/`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ completed: true })
        });
      } catch { }
    }
    showToast(`Đã hoàn thành toàn bộ ${pendingTodos.length} công việc!`, 'success');
  });

  // Batch Action 2: Dọn dẹp task đã xong
  document.querySelector('#btn-batch-clear-done')?.addEventListener('click', async () => {
    const completedTodos = allTodos.filter(t => t.completed);
    if (completedTodos.length === 0) {
      showToast('Không có công việc đã xong nào để dọn dẹp.', 'info');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa tất cả ${completedTodos.length} công việc đã xong khỏi Database?`)) return;

    allTodos = allTodos.filter(t => !t.completed);
    renderList();
    updateMetrics();

    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    for (const todo of completedTodos) {
      try {
        await fetch(`${API_URL}/todos/${todo.id}/`, {
          method: 'DELETE',
          headers
        });
      } catch { }
    }
    showToast(`Đã dọn dẹp ${completedTodos.length} công việc đã hoàn thành!`, 'info');
  });

  // Batch Action 3: Refresh
  document.querySelector('#btn-batch-refresh')?.addEventListener('click', async () => {
    showToast('Đang đồng bộ dữ liệu mới nhất từ Render...', 'info');
    await fetchTodosAndRender();
    showToast('Đã cập nhật dữ liệu mới nhất!', 'success');
  });

  await fetchTodosAndRender();
}

function renderAboutPage() {
  const contentEl = document.querySelector('#page-content');
  if (!contentEl) return;
  contentEl.innerHTML = `
    <h3 style="font-family: var(--font-mono); color: var(--accent-blue); margin-top: 0; font-size: 1.2rem;">// System Architecture & Tech Stack</h3>
    <p style="color: var(--text-muted); line-height: 1.6; font-size: 13.5px;">
      Ứng dụng quản lý công việc Todo Full-stack được xây dựng theo kiến trúc phân tách hoàn toàn (Decoupled Single Page Application).
    </p>

    <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; margin: 16px 0; font-family: var(--font-mono);">
      <div style="margin-bottom: 10px; color: var(--accent-green); font-weight: 700; font-size: 13px;">🌐 ARCHITECTURE SPECIFICATION:</div>
      <ul style="line-height: 1.9; margin: 0; padding-left: 18px; font-size: 13px; color: var(--text-main);">
        <li><strong style="color: var(--accent-blue);">Frontend:</strong> Vite 8, TypeScript 5, Vanilla SPA Router, Responsive CSS.</li>
        <li><strong style="color: var(--accent-orange);">Backend:</strong> Python 3.11, Django REST Framework, SimpleJWT Auth.</li>
        <li><strong style="color: #c084fc);">Database:</strong> SQLite / PostgreSQL.</li>
        <li><strong style="color: var(--accent-green);">Hosting:</strong> Vercel Edge Network & Render Cloud.</li>
      </ul>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap;">
      <a href="https://github.com/phat28062003-ai/todo-frontend" target="_blank" rel="noreferrer" class="btn-primary" style="text-decoration: none; font-size: 12.5px;">
        🐙 GitHub Frontend
      </a>
      <a href="https://github.com/phat28062003-ai/my-portfolio-fullstack" target="_blank" rel="noreferrer" class="tab-btn" style="text-decoration: none; font-size: 12.5px;">
        🚀 Portfolio Hub
      </a>
    </div>
  `;
}

async function renderAdminPage() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const contentEl = document.querySelector('#page-content');
  if (!contentEl) return;

  if (!isLoggedIn) {
    contentEl.innerHTML = `
      <div style="max-width: 420px; margin: 10px auto; text-align: center; background: var(--bg-main); border: 1px solid var(--border-color); padding: 22px 16px; border-radius: 10px;">
        <h3 style="color: var(--accent-red); margin-top: 0; font-size: 1.2rem;">🔒 Authentication Required</h3>
        <p style="color: var(--text-muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 16px;">
          Đăng nhập bằng tài khoản quản trị viên JWT hoặc nhấn Đăng nhập Demo bên dưới.
        </p>
        <input type="text" id="username" class="custom-input" placeholder="Tên đăng nhập (admin / demo)" style="margin-bottom: 10px;" /><br/>
        <input type="password" id="password" class="custom-input" placeholder="Mật khẩu" style="margin-bottom: 14px;" /><br/>
        <button id="login-btn" class="btn-primary" style="width: 100%; margin-bottom: 10px; justify-content: center; padding: 11px;">Đăng Nhập (JWT Authenticate)</button>
        <button id="demo-quick-btn" class="tab-btn" style="width: 100%; border-color: var(--accent-blue); color: var(--accent-blue); padding: 10px;">🚀 Vào Nhanh Bằng Tài Khoản Demo</button>
      </div>
    `;

    document.querySelector('#login-btn')?.addEventListener('click', async () => {
      const u = (document.querySelector('#username') as HTMLInputElement).value;
      const p = (document.querySelector('#password') as HTMLInputElement).value;
      try {
        const response = await fetch(`${API_URL}/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('isLoggedIn', 'true');
          showToast('Xác thực JWT thành công! Chào mừng Administrator.', 'success');
          router();
        } else {
          showToast('Tài khoản hoặc mật khẩu không chính xác!', 'error');
        }
      } catch {
        showToast('Lỗi kết nối máy chủ xác thực Render.', 'error');
      }
    });

    document.querySelector('#demo-quick-btn')?.addEventListener('click', async () => {
      await autoLoginDemo();
      router();
    });
    return;
  }

  contentEl.innerHTML = `
    <div class="admin-tabs" style="margin-bottom: 16px; display: flex; gap: 6px;">
      <button id="tab-stats" class="tab-btn active">📊 Statistics</button>
      <button id="tab-manage" class="tab-btn">📝 Task Management</button>
      <button id="tab-config" class="tab-btn">⚙️ Configurations</button>
    </div>
    <div id="admin-tab-content">Đang tải số liệu...</div>
  `;

  // Tab 1: Statistics
  const loadStats = async () => {
    const tabEl = document.querySelector('#admin-tab-content');
    if (!tabEl) return;
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/todos/`, { headers });
      const data = await res.json();
      const todos: Todo[] = Array.isArray(data) ? data : (data.results || []);
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const pending = total - completed;
      const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      tabEl.innerHTML = `
        <h4 style="font-family: var(--font-mono); margin-top: 0; font-size: 1.1rem;">// System Resource & Task Metrics</h4>
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 14px; border-radius: 8px; margin-bottom: 16px; font-family: var(--font-mono);">
          <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px;">
            <span>COMPLETION_RATE:</span>
            <span style="color: var(--accent-green); font-weight: 700;">${percent}%</span>
          </div>
          <div style="width: 100%; background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${percent}%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-green)); height: 100%; transition: width 0.4s ease;"></div>
          </div>
        </div>
        <ul style="font-family: var(--font-mono); line-height: 2.1; list-style: none; padding-left: 0; font-size: 13.5px;">
          <li>📌 Tổng số công việc xử lý: <strong style="color: var(--accent-blue);">${total}</strong></li>
          <li>✅ Công việc đã hoàn thành: <strong style="color: var(--accent-green);">${completed}</strong></li>
          <li>⏳ Công việc đang chờ: <strong style="color: var(--accent-orange);">${pending}</strong></li>
          <li>🚨 Công việc ưu tiên cao chưa xong: <strong style="color: var(--accent-red);">${highPriority}</strong></li>
        </ul>
      `;
    } catch {
      tabEl.innerHTML = '<span style="color: var(--accent-red);">Lỗi kết nối API lấy dữ liệu thống kê.</span>';
    }
  };

  // Tab 2: Manage
  const loadManage = async () => {
    const tabEl = document.querySelector('#admin-tab-content');
    if (!tabEl) return;
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/todos/`, { headers });
      const data = await res.json();
      const todos: Todo[] = Array.isArray(data) ? data : (data.results || []);

      if (todos.length === 0) {
        tabEl.innerHTML = '<p style="color: var(--text-muted);">Không có bản ghi nào trong cơ sở dữ liệu.</p>';
        return;
      }

      tabEl.innerHTML = `
        <h4 style="font-family: var(--font-mono); margin-top: 0; font-size: 1.1rem;">Database Records (${todos.length} tasks):</h4>
        <ul style="padding-left: 0; list-style: none; max-height: 400px; overflow-y: auto; margin: 0;">
          ${todos.map(t => `
            <li class="task-item" style="margin-bottom: 8px;">
              <span class="toggle-task" data-id="${t.id}" style="cursor: pointer; flex: 1; font-size: 13px; ${t.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">
                ${t.title} [${(t.priority || 'med').toUpperCase()}] ${t.completed ? '🟢 [DONE]' : '⏳ [PENDING]'}
              </span>
              <button class="del-btn btn-admin-del" data-id="${t.id}">Delete</button>
            </li>
          `).join('')}
        </ul>
      `;

      document.querySelectorAll('.toggle-task').forEach(item => {
        item.addEventListener('click', async (e) => {
          const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
          const currentTodo = todos.find(t => t.id.toString() === id);
          if (!currentTodo || !id) return;

          await fetch(`${API_URL}/todos/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ completed: !currentTodo.completed })
          });
          loadManage();
        });
      });

      document.querySelectorAll('.btn-admin-del').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = (e.target as HTMLElement).getAttribute('data-id');
          if (confirm('Xác nhận xóa bản ghi này khỏi Database?')) {
            await fetch(`${API_URL}/todos/${id}/`, {
              method: 'DELETE',
              headers
            });
            loadManage();
          }
        });
      });
    } catch {
      tabEl.innerHTML = '<span style="color: var(--accent-red);">Lỗi tải danh sách quản lý.</span>';
    }
  };

  // Tab 3: Configurations
  const loadConfig = () => {
    const tabEl = document.querySelector('#admin-tab-content');
    if (!tabEl) return;
    const isMaintenance = localStorage.getItem('maintenanceMode') === 'true';
    const currentTitle = localStorage.getItem('appTitle') || 'IT_Dashboard // Todo-Manager';

    tabEl.innerHTML = `
      <h4 style="font-family: var(--font-mono); margin-top: 0; font-size: 1.1rem;">System Settings:</h4>
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12.5px; color: var(--text-muted); display: block; margin-bottom: 6px;">Application Title:</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="title-input" class="custom-input" value="${currentTitle}" style="flex: 1;" />
          <button id="save-title-btn" class="btn-primary" style="white-space: nowrap;">Save</button>
        </div>
      </div>
      <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px;">
        <label style="cursor: pointer; font-family: var(--font-mono); font-size: 13px; display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="maintenance-check" ${isMaintenance ? 'checked' : ''} style="width: 18px; height: 18px;" />
          <span>Kích hoạt chế độ bảo trì hệ thống</span>
        </label>
      </div>
    `;

    document.querySelector('#save-title-btn')?.addEventListener('click', () => {
      const titleInput = document.querySelector('#title-input') as HTMLInputElement;
      if (titleInput && titleInput.value.trim()) {
        localStorage.setItem('appTitle', titleInput.value.trim());
        showToast('Đã lưu tiêu đề ứng dụng!', 'success');
        setTimeout(() => window.location.reload(), 600);
      }
    });

    document.querySelector('#maintenance-check')?.addEventListener('change', (e) => {
      const isChecked = (e.target as HTMLInputElement).checked;
      localStorage.setItem('maintenanceMode', isChecked.toString());
      showToast(isChecked ? 'Đã bật chế độ bảo trì!' : 'Đã tắt chế độ bảo trì!', 'info');
    });
  };

  const handleTabSwitch = (activeId: string, loader: () => void) => {
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`#${activeId}`)?.classList.add('active');
    loader();
  };

  document.querySelector('#tab-stats')?.addEventListener('click', () => handleTabSwitch('tab-stats', loadStats));
  document.querySelector('#tab-manage')?.addEventListener('click', () => handleTabSwitch('tab-manage', loadManage));
  document.querySelector('#tab-config')?.addEventListener('click', () => handleTabSwitch('tab-config', loadConfig));

  loadStats();
}

function router() {
  const hash = window.location.hash || '#/';
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
