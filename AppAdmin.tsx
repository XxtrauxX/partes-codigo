import { useState, useEffect } from "react";
import { Users, DollarSign, Sun, Moon, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import './App.css';

// --- INTERFAZ COMPLETA ---
interface Registration {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  document: string;
  payment_reference: string;
  payment_date: string | null;
  total_paym_value: number | null;
  selected_course: string;
  num_seats: number;
  created_at: string;
  status: string;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA DE FETCH CON SEGURIDAD ---
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiKey = import.meta.env.VITE_ADMIN_API_KEY;

    if (!apiUrl || !apiKey) {
      setError("Error de configuración: VITE_API_URL o VITE_ADMIN_API_KEY no están definidas en el archivo .env");
      return;
    }

    const requestHeaders = { 'x-api-key': apiKey };

    const fetchData = async () => {
      try {
        const [registrosResponse, confirmedResponse] = await Promise.all([
          fetch(`${apiUrl}landing-ia/registros`, { headers: requestHeaders }),
          fetch(`${apiUrl}landing-ia/registros/confirmed`, { headers: requestHeaders })
        ]);

        if (!registrosResponse.ok || !confirmedResponse.ok) {
          throw new Error("Error de comunicación con el servidor.");
        }

        const registrosResult = await registrosResponse.json();
        const confirmedResult = await confirmedResponse.json();

        if (registrosResult.success) {
          setRegistrations(registrosResult.data);
        } else {
          setError(registrosResult.message);
        }

        if (confirmedResult.success && confirmedResult.data) {
          const totalConfirmed = confirmedResult.data.total;
          setConfirmedCount(totalConfirmed);
          setTotalIncome(totalConfirmed * 97000);
        } else {
          setError(confirmedResult.message);
        }

      } catch (err) {
        setError("Error de red. Asegúrate de que el backend esté corriendo.");
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // --- FUNCIONES Y LÓGICA DEL COMPONENTE ---
  const stats = [
    { title: "Registros Confirmados", value: confirmedCount, icon: Users },
    { title: "Ingresos Totales (COP)", value: `$${totalIncome.toLocaleString('es-CO')}`, icon: DollarSign }
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    // Usamos una nueva fecha para asegurar la correcta interpretación de la zona horaria
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStatus = (status: string) => {
    const statusClass =
      status.toUpperCase() === 'EXITOSO'
        ? 'status-badge status-exitoso'
        : status.toUpperCase() === 'EXPIRADO'
        ? 'status-badge status-expirado'
        : 'status-badge status-pendiente';
    return <span className={statusClass}>{status}</span>;
  };

  const handleDownload = () => {
    const excelData = registrations.map(reg => ({
      'ID': reg.id,
      'Nombre': reg.name,
      'Apellido': reg.lastname,
      'Email': reg.email,
      'Teléfono': reg.phone,
      'Documento': reg.document,
      'Referencia de Pago': reg.payment_reference,
      'Valor Pagado (COP)': reg.total_paym_value,
      'Fecha de Pago': formatDate(reg.payment_date),
      'Curso Seleccionado': formatDate(reg.selected_course),
      'Estado del Pago': reg.status,
      '# Cupos': reg.num_seats,
      'Fecha Registro': new Date(reg.created_at).toLocaleString('es-CO')
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [ {wch:5}, {wch:15}, {wch:15}, {wch:25}, {wch:15}, {wch:15}, {wch:25}, {wch:15}, {wch:15}, {wch:18}, {wch:12}, {wch:8}, {wch:20} ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
    XLSX.writeFile(workbook, `Registros_IA_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Panel de Administración - Cursos IA</h1>
        <div className="theme-toggle">
          <Sun className="icon" />
          <button className="toggle-button" onClick={toggleTheme}>
            <div className="toggle-thumb"></div>
          </button>
          <Moon className="icon" />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <stat.icon size={20} />
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Registros Recientes</h2>
          <button className="download-button" onClick={handleDownload}>
            <Download size={16} />
            Descargar Excel
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th># Cupos</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length > 0 ? (
              registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>{registration.id}</td>
                  <td>{`${registration.name} ${registration.lastname}`}</td>
                  <td>{registration.email}</td>
                  <td>{registration.phone}</td>
                  <td>{registration.document}</td>
                  <td>{registration.num_seats}</td>
                  <td>{renderStatus(registration.status)}</td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={7}>Cargando registros...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
