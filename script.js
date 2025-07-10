// script.js (همان کد قبلی با تغییرات جزئی در renderTodos و showToast)

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const todoListElement = document.getElementById('todoList');

// عناصر مربوط به مودال افزودن
const openAddModalBtn = document.getElementById('openAddModalBtn');
const addModal = document.getElementById('addModal');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const todoForm = document.getElementById('todoForm');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const addTodoBtn = document.getElementById('addTodoBtn'); // دکمه افزودن کار داخل مودال

// عناصر مربوط به مودال ویرایش
const editModal = document.getElementById('editModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const editTodoForm = document.getElementById('editTodoForm');
const editIdInput = document.getElementById('editId');
const editTitleInput = document.getElementById('editTitle');
const editBodyInput = document.getElementById('editBody'); // تصحیح مجدد: مطمئن شوید این خط درست است
const saveEditBtn = document.getElementById('saveEditBtn'); // دکمه ذخیره تغییرات
const cancelEditButton = document.getElementById('cancelEdit');

let todos = []; // آرایه‌ای برای نگهداری داده‌های کارها در سمت کلاینت

// --- توابع کمکی عمومی ---

/**
 * دکمه را در حالت لودینگ قرار می‌دهد یا از آن خارج می‌کند.
 * @param {HTMLElement} buttonElement - عنصر دکمه
 * @param {boolean} isLoading - اگر true باشد، حالت لودینگ فعال می‌شود.
 * @param {string} [originalText=''] - متن اصلی دکمه (در صورت لزوم برای بازیابی)
 */
function setButtonLoading(buttonElement, isLoading, originalText = '') {
    if (isLoading) {
        buttonElement.dataset.originalText = originalText || buttonElement.textContent.trim();
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> در حال پردازش...';
        buttonElement.disabled = true;
        buttonElement.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        if (buttonElement && buttonElement.dataset.originalText) {
            buttonElement.innerHTML = buttonElement.dataset.originalText;
        } else {
            buttonElement.textContent = originalText;
        }
        buttonElement.disabled = false;
        buttonElement.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

/**
 * مودال مشخص شده را باز می‌کند.
 * @param {HTMLElement} modalElement - عنصر HTML مودال
 */
function openModal(modalElement) {
    modalElement.classList.remove('hidden');
    modalElement.classList.add('flex');
    document.body.classList.add('overflow-hidden'); // Prevent body scroll
    
    // Add animation classes
    const modalContent = modalElement.querySelector('.modal-content-area'); // Target the specific content div
    if (modalContent) {
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    }
}

/**
 * مودال مشخص شده را می‌بندد.
 * @param {HTMLElement} modalElement - عنصر HTML مودال
 */
function closeModal(modalElement) {
    // Add animation classes for closing
    const modalContent = modalElement.querySelector('.modal-content-area');
    if (modalContent) {
        modalContent.classList.remove('opacity-100', 'scale-100');
        modalContent.classList.add('opacity-0', 'scale-95');
    }

    // Hide after animation (adjust duration if needed)
    setTimeout(() => {
        modalElement.classList.add('hidden');
        modalElement.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }, 300); // Should match transition duration
}

/**
 * نمایش پیام Toast.
 * @param {string} message - متن پیام
 * @param {string} type - نوع پیام ('success', 'error', 'info', 'warning')
 */
function showToast(message, type = 'info') {
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = "linear-gradient(to right, #10B981, #34D399)"; // Tailwind green-500, green-400
            break;
        case 'error':
            backgroundColor = "linear-gradient(to right, #EF4444, #F87171)"; // Tailwind red-500, red-400
            break;
        case 'warning':
            backgroundColor = "linear-gradient(to right, #F59E0B, #FBBF24)"; // Tailwind yellow-500, yellow-400
            break;
        case 'info':
        default:
            backgroundColor = "linear-gradient(to right, #3B82F6, #60A5FA)"; // Tailwind blue-500, blue-400
            break;
    }

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: backgroundColor,
            borderRadius: "12px", // گوشه‌های گردتر برای Toast
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)", // سایه قوی‌تر
            fontFamily: "inherit",
            fontSize: "1.1rem", // متن بزرگتر
            padding: "15px 25px" // پدینگ بیشتر
        },
        onClick: function(){}
    }).showToast();
}


// --- توابع رندر و فچ ---

/**
 * نمایش و رندر کردن کارها در DOM.
 * این تابع همیشه آرایه 'todos' محلی را منعکس می‌کند.
 */
function renderTodos() {
    todoListElement.innerHTML = ''; // پاک کردن لیست قبل از رندر مجدد

    if (todos.length === 0) {
        todoListElement.innerHTML = '<p class="text-center text-gray-500 py-8">موردی برای نمایش وجود ندارد. یک کار جدید اضافه کنید!</p>';
        return;
    }

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.id = `todo-item-${todo.id}`; // یک ID منحصر به فرد برای هر آیتم DOM
        todoItem.classList.add(
            'bg-white', 'p-6', 'rounded-2xl', 'shadow-lg', 'border',
            'border-gray-200', 'flex', 'flex-col', 'md:flex-row',
            'justify-between', 'items-start', 'md:items-center', 'gap-5',
            'hover:shadow-xl', 'transition-all', 'duration-300', 'transform', 'hover:-translate-y-1'
        );

        todoItem.innerHTML = `
            <div class="flex-grow">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">${todo.title}</h3>
                <p class="text-gray-600 text-base leading-relaxed">${todo.body || 'بدون توضیحات'}</p>
            </div>
            <div class="flex-shrink-0 flex gap-3 mt-5 md:mt-0">
                <button data-id="${todo.id}" class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-5 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-yellow-400 focus:ring-opacity-75">
                    <i class="fas fa-edit ml-2"></i> ویرایش
                </button>
                <button data-id="${todo.id}" class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-red-400 focus:ring-opacity-75">
                    <i class="fas fa-trash-alt ml-2"></i> حذف
                </button>
            </div>
        `;
        todoListElement.appendChild(todoItem);
    });
}

/**
 * دریافت کارها از API و پر کردن آرایه 'todos' محلی.
 */
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        todos = data.slice(0, 10); // Limiting to first 10 for demo purposes with jsonplaceholder
        renderTodos();
        console.log("کارها با موفقیت از API بارگذاری شدند.");
    } catch (error) {
        console.error("خطا در دریافت کارها:", error);
        todoListElement.innerHTML = `<p class="text-red-500 text-center py-8">خطا در بارگذاری کارها: ${error.message}</p>`;
        showToast(`خطا در بارگذاری کارها: ${error.message}. لطفاً اتصال اینترنت خود را بررسی کنید.`, 'error');
    }
}

// --- عملیات CRUD ---

/**
 * افزودن یک کار جدید.
 * این عملیات در jsonplaceholder موفقیت‌آمیز است و یک ID جدید برمی‌گرداند.
 * ما آیتم جدید را به آرایه محلی اضافه کرده و لیست را رندر می‌کنیم.
 */
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    setButtonLoading(addTodoBtn, true, 'افزودن کار'); // فعال کردن لودینگ

    const newTitle = titleInput.value.trim();
    const newBody = bodyInput.value.trim();

    if (!newTitle) {
        showToast('عنوان کار نمی‌تواند خالی باشد!', 'warning');
        setButtonLoading(addTodoBtn, false, 'افزودن کار'); // غیرفعال کردن لودینگ در صورت خطا
        return;
    }

    const newTodoData = {
        title: newTitle,
        body: newBody,
        userId: 1
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTodoData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const addedTodo = await response.json();
        todos.unshift({ ...newTodoData, id: addedTodo.id });
        renderTodos();
        titleInput.value = '';
        bodyInput.value = '';
        closeModal(addModal);
        console.log(`کار جدید اضافه شد (ID محلی: ${addedTodo.id}).`);
        showToast('کار جدید با موفقیت اضافه شد!', 'success');
    } catch (error) {
        console.error("خطا در افزودن کار:", error);
        showToast(`خطا در افزودن کار: ${error.message}. لطفاً کنسول را بررسی کنید.`, 'error');
    } finally {
        setButtonLoading(addTodoBtn, false, 'افزودن کار'); // غیرفعال کردن لودینگ در هر صورت
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * حذف یک کار.
 * از SweetAlert2 برای تأیید کاربر استفاده می‌شود.
 * @param {number} id - ID کار برای حذف
 */
async function deleteTodo(id) {
    // نمایش پنجره تأیید SweetAlert2
    const result = await Swal.fire({
        title: 'آیا مطمئن هستید؟',
        text: "شما نمی‌توانید این عملیات را برگردانید! (این تغییر با رفرش صفحه از بین می‌رود)",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444', // Tailwind red-500
        cancelButtonColor: '#6B7280', // Tailwind gray-500
        confirmButtonText: 'بله، حذف کن!',
        cancelButtonText: 'خیر، لغو کن',
        customClass: {
            popup: 'text-right', // برای راست چین کردن متن
        }
    });

    if (result.isConfirmed) { // اگر کاربر "بله، حذف کن!" را تایید کرد
        const deleteButton = document.querySelector(`#todo-item-${id} .delete-btn`);
        if (deleteButton) {
            setButtonLoading(deleteButton, true, 'حذف'); // فعال کردن لودینگ روی دکمه خاص
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            todos = todos.filter(todo => todo.id !== id);
            renderTodos(); // رندر مجدد لیست
            console.log(`کار با ID ${id} به صورت محلی حذف شد.`);
            showToast('کار با موفقیت حذف شد (تغییرات با رفرش صفحه از بین می‌روند).', 'success');
        } catch (error) {
            console.error("خطا در حذف کار:", error);
            showToast(`خطا در حذف کار: ${error.message}. لطفاً کنسول را بررسی کنید.`, 'error');
        } finally {
            // نیازی به خاموش کردن لودینگ در اینجا نیست چون آیتم و دکمه‌اش از DOM حذف می‌شوند.
        }
    } else {
        // اگر کاربر حذف را لغو کرد
        showToast('عملیات حذف لغو شد.', 'info');
    }
}

/**
 * باز کردن مودال ویرایش با پر کردن فیلدها از داده‌های کار مورد نظر.
 * @param {number} id - ID کار برای ویرایش
 */
function openEditModal(id) {
    const todoToEdit = todos.find(todo => todo.id === id);
    if (todoToEdit) {
        editIdInput.value = todoToEdit.id;
        editTitleInput.value = todoToEdit.title;
        editBodyInput.value = todoToEdit.body;
        openModal(editModal);
    } else {
        showToast('کار مورد نظر برای ویرایش یافت نشد!', 'error');
    }
}

/**
 * ویرایش یک کار.
 * اگر ID آیتم بزرگتر از 100 باشد، عملیات فقط به صورت محلی انجام می‌شود.
 * در غیر این صورت، درخواست PUT به API ارسال می‌گردد.
 */
editTodoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    setButtonLoading(saveEditBtn, true, 'ذخیره تغییرات'); // فعال کردن لودینگ

    const id = parseInt(editIdInput.value);
    const updatedTitle = editTitleInput.value.trim();
    const updatedBody = editBodyInput.value.trim();

    if (!updatedTitle) {
        showToast('عنوان کار نمی‌تواند خالی باشد!', 'warning');
        setButtonLoading(saveEditBtn, false, 'ذخیره تغییرات'); // غیرفعال کردن لودینگ در صورت خطا
        return;
    }

    const updatedTodoData = {
        id: id,
        title: updatedTitle,
        body: updatedBody,
        userId: 1
    };

    if (id > 100) {
        console.warn(`آیتم با ID ${id} توسط jsonplaceholder پشتیبانی نمی‌شود. فقط تغییرات محلی اعمال می‌شود.`);
        todos = todos.map(todo => (todo.id === id ? { ...todo, title: updatedTitle, body: updatedBody } : todo));
        renderTodos();
        closeModal(editModal);
        console.log(`کار با ID ${id} به صورت محلی به‌روزرسانی شد.`);
        showToast('کار با موفقیت به صورت محلی به‌روزرسانی شد (تغییرات با رفرش صفحه از بین می‌روند).', 'success');
        setButtonLoading(saveEditBtn, false, 'ذخیره تغییرات');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTodoData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('پاسخ از API برای ویرایش:', data);

        todos = todos.map(todo => (todo.id === id ? { ...todo, title: updatedTitle, body: updatedBody } : todo));
        renderTodos();
        closeModal(editModal);
        console.log(`کار با ID ${id} به صورت محلی به‌روزرسانی شد.`);
        showToast('کار با موفقیت به‌روزرسانی شد (تغییرات با رفرش صفحه از بین می‌روند).', 'success');
    } catch (error) {
        console.error("خطا در ویرایش کار:", error);
        showToast(`خطا در ویرایش کار: ${error.message}. لطفاً کنسول را بررسی کنید.`, 'error');
    } finally {
        setButtonLoading(saveEditBtn, false, 'ذخیره تغییرات');
    }
});

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', fetchTodos);

// Event Listeners برای مودال افزودن
openAddModalBtn.addEventListener('click', () => {
    openModal(addModal);
    titleInput.value = '';
    bodyInput.value = '';
});
closeAddModalBtn.addEventListener('click', () => closeModal(addModal));
addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
        closeModal(addModal);
    }
});

// Event Listeners برای مودال ویرایش
closeEditModalBtn.addEventListener('click', () => closeModal(editModal));
cancelEditButton.addEventListener('click', () => closeModal(editModal));
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal(editModal);
    }
});

// مدیریت کلیک روی دکمه‌های ویرایش و حذف با استفاده از Event Delegation
todoListElement.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id);
        deleteTodo(id);
    } else if (e.target.classList.contains('edit-btn')) {
        const id = parseInt(e.target.dataset.id);
        openEditModal(id);
    }
});