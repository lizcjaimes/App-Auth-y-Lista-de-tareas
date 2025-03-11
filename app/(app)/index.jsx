import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useSession } from "../../ctx";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Index() {
  return (
    <View style={styles.container}>
      <SQLiteProvider databaseName="tasks.db" onInit={migrateDbIfNeeded}>
        <Header />
        <TaskManager />
      </SQLiteProvider>
    </View>
  );
}


function Header() {
  const { session, signOut, isLoading } = useSession();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [version, setVersion] = useState("");

  useEffect(() => {
    async function setup() {
      const result = await db.getFirstAsync("SELECT sqlite_version()");
      setVersion(result ? Object.values(result)[0] : "Desconocida");
    }
    setup();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={styles.headerText}>¡Bienvenido!</Text>,
      headerRight: () => (
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, session, signOut]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text>Cargando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerSubText}>Hecho por: Lizbeth Concepcion Jaimes</Text>
    </View>
  );

}

// CRUD
function TaskManager() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { session } = useSession();
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    async function loadTasks() {
      const result = await db.getAllAsync("SELECT * FROM tasks");
      setTasks(result);
    }
    loadTasks();
  }, []);

  async function saveTask() {
    if (task.trim() === "") return;

    if (editingTaskId) {
      await db.runAsync("UPDATE tasks SET name = ? WHERE id = ?", task, editingTaskId);
      setEditingTaskId(null);
    } else {
      await db.runAsync("INSERT INTO tasks (name) VALUES (?)", task);
    }

    setTask("");
    const result = await db.getAllAsync("SELECT * FROM tasks");
    setTasks(result);
  }

  async function deleteTask(id) {
    await db.runAsync("DELETE FROM tasks WHERE id = ?", id);
    const result = await db.getAllAsync("SELECT * FROM tasks");
    setTasks(result);
  }

  function editTask(item) {
    setTask(item.name);
    setEditingTaskId(item.id);
  }

  if (!session) {
    console.log("🔄 No hay sesión activa. Redirigiendo al login...");
    router.replace("/sign-in");
    return null;
  }

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>Lista de Tareas</Text>

      <TextInput
        placeholder="Nueva tarea..."
        value={task}
        onChangeText={setTask}
        style={styles.input}
      />

      <TouchableOpacity onPress={saveTask} style={styles.addButton}>
        <Text style={styles.addButtonText}>{editingTaskId ? "Guardar cambios" : "Agregar Tarea"}</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItemContainer}>
            <Text style={styles.taskText}>{item.name}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => editTask(item)} style={styles.updateButton}>
                <Text style={styles.buttonText}>Actualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// Migrar base de datos si es necesario
async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  let result = await db.getFirstAsync("PRAGMA user_version");
  let currentDbVersion = result ? Object.values(result)[0] : 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);
    `);
    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

// Todos los estilos del index
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  headerContainer: { padding: 15, backgroundColor: "#8d99ae", alignItems: "center" },
  headerText: { color: "#00000", fontSize: 20, fontWeight: "bold" },
  headerSubText: { color: "#fff", fontSize: 12 },
  logoutButton: { backgroundColor: "#284b63", padding: 8, borderRadius: 5, marginRight: 10 },
  logoutText: { color: "#fff", fontWeight: "bold" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  contentContainer: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#333" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  addButton: { backgroundColor: "#7b1fa2", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 15 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  todoItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  taskText: { fontSize: 16, color: "#333" },

  buttonContainer: { flexDirection: "row" },
  updateButton: { backgroundColor: "#ff9800", padding: 8, borderRadius: 5, marginRight: 5 },
  deleteButton: { backgroundColor: "#d32f2f", padding: 8, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

