import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';


export function DataProvider({ children }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState({});
  const [users, setUsers] = useState([]);
  
  const [fines, setFines] = useState([]);
  const [morningBliss, setMorningBliss] = useState([]);
  const [prayerAttendance, setPrayerAttendance] = useState([]);
  const [phonePasses, setPhonePasses] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [pointRules, setPointRules] = useState([]);
  const [pointLogs, setPointLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const { data: clsData } = await supabase.from('classes').select('*').order('name');
      setClasses(clsData ? clsData.map(c => c.name) : []);

      const { data: stuData } = await supabase.from('students').select('*').order('name');
      const smap = {};
      if (stuData) {
        stuData.forEach(s => {
          if (!smap[s.class_id]) smap[s.class_id] = [];
          smap[s.class_id].push({ id: s.id, name: s.name, roll: s.roll_number, points: s.points, tally_points: s.tally_points || 0, star_points: s.star_points || 0, other_points: s.other_points || 0 });
        });
      }
      setStudents(smap);

      const { data: uData } = await supabase.from('users').select('*, short_name');
      if (uData) setUsers(uData);

      const { data: fData } = await supabase.from('fines').select('*').order('date', { ascending: false });
      if (fData) setFines(fData);

      const { data: mbData } = await supabase.from('morning_bliss').select('*, evaluated_by');
      if (mbData) setMorningBliss(mbData);

      const { data: paData } = await supabase.from('prayer_attendance').select('*');
      if (paData) setPrayerAttendance(paData);

      const { data: ppData } = await supabase.from('phone_passes').select('*');
      if (ppData) setPhonePasses(ppData);

      const { data: gpData } = await supabase.from('gate_passes').select('*');
      if (gpData) setGatePasses(gpData);

      const { data: prData } = await supabase.from('point_rules').select('*').order('created_at', { ascending: false });
      if (prData) setPointRules(prData);

      const { data: plData } = await supabase.from('point_logs').select('*').order('created_at', { ascending: false });
      if (plData) setPointLogs(plData);

    } catch (e) {
      console.error("Error loading data from Supabase:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const channel = supabase.channel('realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [downloadInfo, setDownloadInfo] = useState(null);

  const triggerDownload = (doc, filename) => {
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setDownloadInfo({ blob, url, name: filename });
    } catch (err) {
      console.error("Error during download trigger:", err);
    }
  };

  return (
    <DataContext.Provider value={{ classes, students, users, fines, morningBliss, prayerAttendance, phonePasses, gatePasses, pointRules, pointLogs, loadData, downloadInfo, setDownloadInfo, triggerDownload }}>
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontFamily: "system-ui" }}>Connecting to Supabase Database...</div> : children}
    </DataContext.Provider>
  );
}

// Fixed: Move context and hook to bottom for better Vite HMR support
const DataContext = createContext(null);
export const useAppStore = () => useContext(DataContext);
