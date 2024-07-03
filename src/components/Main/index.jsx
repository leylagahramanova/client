import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";

const Main = () => {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState({ title: "", task: "", completed: false });
    const [error, setError] = useState("");
    const url = "http://localhost:8082/api/tasks";  // Updated port

    useEffect(() => {
        async function fetchTasks() {
            try {
                const { data: res } = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
                });
                setTasks(res);
            } catch (error) {
                console.error('Error loading tasks:', error.response ? error.response.data : error.message);
                setError(error.response ? error.response.data.message : error.message);
            }
        }
        fetchTasks();
    }, []);

    const handleChange = (e) => {
        setTask({ ...task, [e.target.name]: e.target.value });
    };

  const addTask = async (e) => {
    e.preventDefault();
    if (!task.title || !task.task) {
        alert('Both Title and Task are required');
        return;
    }
    try {
        let res;
        if (task._id) {
            res = await axios.put(`${url}/${task._id}`, {
                title: task.title,
                task: task.task,
                completed: task.completed,
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            setTasks(prevTasks => prevTasks.map(t => t._id === task._id ? res.data.task : t));
        } else {
            res = await axios.post(url, task, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            const newTask = res.data.task;
            setTasks(prevTasks => [...prevTasks, newTask]);
        }
        setTask({ title: "", task: "", completed: false });
    } catch (error) {
        console.error('Error adding/updating task:', error.response ? error.response.data : error.message);
        setError(error.response ? error.response.data.message : error.message);
    }
};

    const updateTask = async (id) => {
        try {
            const taskToUpdate = tasks.find(t => t._id === id);
            const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
            const res = await axios.put(`${url}/${id}`, updatedTask, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            setTasks(tasks.map(t => t._id === id ? res.data.task : t));
        } catch (error) {
            console.error('Error updating task:', error.response ? error.response.data : error.message);
            setError(error.response ? error.response.data.message : error.message);
        }
    };

    const editTask = (id) => {
        const currentTask = tasks.find((task) => task._id === id);
        setTask(currentTask);
    };

    const deleteTask = async (id) => {
        const confirmed = window.confirm("Are you sure?");
        if (confirmed) {
            try {
                await axios.delete(`${url}/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
                });
                setTasks(tasks.filter((task) => task._id !== id));
            } catch (error) {
                console.error('Error deleting task:', error.response ? error.response.data : error.message);
                setError(error.response ? error.response.data.message : error.message);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>fakebook</h1>
                <button className={styles.white_btn} onClick={handleLogout}>
                    Logout
                </button>
            </nav>
            <main className={styles.main}>
                <h1 className={styles.heading}>TO-DO</h1>
                <div className={styles.container}>
                    <form onSubmit={addTask} className={styles.form_container}>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Title"
                            name="title"
                            onChange={handleChange}
                            value={task.title}
                        />
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Task to be done..."
                            name="task"
                            onChange={handleChange}
                            value={task.task}
                        />
                        <button type="submit" className={styles.submit_btn}>
                            {task._id ? "Update" : "Add"}
                        </button>
                    </form>
                    {tasks.map((task, index) => (
                        <div className={styles.task_container} key={task._id}>
                            <input
                                type="checkbox"
                                className={styles.check_box}
                                checked={task.completed}
                                onChange={() => updateTask(task._id)}
                            />
                            <p
                                className={
                                    task.completed
                                        ? styles.task_text + " " + styles.line_through
                                        : styles.task_text
                                }
                            >
                                {task.title}: {task.task}
                            </p>
                            <button
                                onClick={() => editTask(task._id)}
                                className={styles.edit_task}
                            >
                                Edit
                            </button>
                            <button onClick={() => deleteTask(task._id)} className={styles.remove_task}>
                                Remove
                            </button>
                        </div>
                    ))}
                    {tasks.length === 0 && <h2 className={styles.no_tasks}>No tasks</h2>}
                </div>
            </main>
        </div>
    );
};

export default Main;
