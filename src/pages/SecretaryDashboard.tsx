import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AppointmentWithDetails, Patient, Profile, Specialty } from '../types';
import { LogOut, Plus, Users, Stethoscope, Search, Edit } from 'lucide-react';
import { format } from 'date-fns';

// A single dashboard that contains basic Secretary views (simplified for the prompt)
export function SecretaryDashboard() {
  const { profile, signOut } = useAuth();
  
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'agendamentos' | 'pacientes'>('agendamentos');
  
  // Forms States
  const [showApptModal, setShowApptModal] = useState(false);
  const [newAppt, setNewAppt] = useState({ patient_id: '', specialty_id: '', doctor_id: '', appointment_date: '', appointment_time: '', turn: 'MANHÃ', status: 'agendado' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [apptsRes, patRes, docRes, specRes] = await Promise.all([
      supabase.from('appointments').select('*, patients(*), specialties(*), profiles(*)').order('appointment_date', { ascending: false }),
      supabase.from('patients').select('*').order('full_name'),
      supabase.from('profiles').select('*').eq('role', 'medico'),
      supabase.from('specialties').select('*')
    ]);

    if (apptsRes.data) setAppointments(apptsRes.data as unknown as AppointmentWithDetails[]);
    if (patRes.data) setPatients(patRes.data);
    if (docRes.data) setDoctors(docRes.data as Profile[]);
    if (specRes.data) setSpecialties(specRes.data);
    
    setLoading(false);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('appointments').insert([newAppt]);
    setShowApptModal(false);
    fetchData();
  };

  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm("Deseja realmente cancelar e faturar a remoção do agendamento?")) {
      await supabase.from('appointments').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="UNIPÊ Logo" className="h-10 object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-800">Medicina - UNIPÊ</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <button onClick={() => setView('agendamentos')} className={view === 'agendamentos' ? "text-blue-600 border-b-2 border-blue-600 py-5" : "hover:text-slate-800 transition-colors py-5"}>Agenda Global</button>
            <button onClick={() => setView('pacientes')} className={view === 'pacientes' ? "text-blue-600 border-b-2 border-blue-600 py-5" : "hover:text-slate-800 transition-colors py-5"}>Pacientes</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={signOut} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-50" title="Sair">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-xs font-semibold leading-none hidden sm:block">
              <p className="text-slate-900">{profile?.full_name || 'Usuário'}</p>
              <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wider">Secretária</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ações Rápidas</h3>
            <button onClick={() => setShowApptModal(true)} className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navegação</h3>
            <div className="flex flex-col gap-2">
              <label onClick={() => setView('agendamentos')} className={`flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg transition-colors ${view === 'agendamentos' ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Agendamentos</span>
              </label>
              <label onClick={() => setView('pacientes')} className={`flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg transition-colors ${view === 'pacientes' ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Users className="w-4 h-4 text-blue-600" />
                <span>Pacientes</span>
              </label>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-blue-800 text-xs font-bold mb-1">Dica do Dia</p>
              <p className="text-blue-600 text-[11px] leading-relaxed italic">
                "Mantenha as notas médicas atualizadas para facilitar o retorno do paciente."
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium text-center">
              Desenvolvido por: Prof. Rodrigo Niskier | 2026
            </div>
          </div>
        </aside>

        {/* Main Table View */}
        <section className="flex-1 flex flex-col p-4 md:p-8 gap-4 md:gap-8 bg-slate-50 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between shrink-0 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {view === 'agendamentos' ? 'Agenda de Consultas' : 'Base de Pacientes'}
              </h1>
              <p className="text-slate-500 mt-1">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy")}</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Total:</span>
                <span className="text-lg font-bold text-slate-800">{view === 'agendamentos' ? appointments.length : patients.length}</span>
              </div>
            </div>
          </div>

          {/* Data Table Container */}
          {loading ? (
             <div className="flex flex-1 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : view === 'agendamentos' ? (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="grid grid-cols-6 bg-slate-50 border-b border-slate-200 px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                <div className="col-span-2 md:col-span-1">Horário / Turno</div>
                <div className="col-span-4 md:col-span-2">Paciente</div>
                <div className="hidden md:block col-span-1">Especialidade</div>
                <div className="hidden md:block col-span-1">Médico</div>
                <div className="hidden md:block col-span-1">Status</div>
              </div>

              <div className="flex-1 overflow-auto divide-y divide-slate-100">
                {appointments.map(appt => (
                  <div key={appt.id} className="grid grid-cols-6 px-4 md:px-6 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="col-span-2 md:col-span-1">
                      <p className={`font-mono font-bold ${appt.status === 'atendido' ? 'text-green-700' : 'text-slate-700'}`}>{appt.appointment_time || '00:00'}</p>
                      <p className={`text-[10px] uppercase ${appt.status === 'atendido' ? 'text-green-400' : 'text-slate-400'}`}>{appt.turn}</p>
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <p className="font-semibold text-slate-800 line-clamp-1">{appt.patients?.full_name}</p>
                      <p className="text-xs text-slate-500">{appt.patients?.rg ? `RG: ${appt.patients.rg}` : 'RG não informado'}</p>
                      
                      {/* Mobile Only Info */}
                      <div className="md:hidden mt-2 flex flex-wrap gap-2 items-center">
                         <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{appt.specialties?.name}</span>
                         <span className={`text-[10px] font-bold capitalize ${
                           appt.status === 'atendido' ? 'text-green-600' :
                           appt.status === 'cancelado' || appt.status === 'faltou' ? 'text-red-600' :
                           'text-blue-600'
                         }`}>{appt.status}</span>
                      </div>
                    </div>
                    <div className="hidden md:block col-span-1">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[11px] font-bold uppercase">{appt.specialties?.name}</span>
                    </div>
                    <div className="hidden md:block col-span-1">
                      <p className="text-sm font-medium">{appt.profiles?.full_name}</p>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(appt.id); }} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 mt-1 transition-colors">Excluir Agendamento</button>
                    </div>
                    <div className="hidden md:block col-span-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                           appt.status === 'atendido' ? 'bg-green-500' :
                           appt.status === 'cancelado' || appt.status === 'faltou' ? 'bg-red-500' :
                           'bg-blue-500'
                        }`}></div>
                        <span className={`text-xs font-bold capitalize ${
                           appt.status === 'atendido' ? 'text-green-600' :
                           appt.status === 'cancelado' || appt.status === 'faltou' ? 'text-red-600' :
                           'text-slate-600'
                        }`}>{appt.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">Nenhum agendamento encontrado.</div>
                )}
              </div>
              
              <div className="h-12 border-t border-slate-100 flex items-center justify-between px-6 bg-slate-50/50 shrink-0">
                <span className="text-xs text-slate-400 font-medium italic">Última atualização: Tempo Real (Supabase Connected)</span>
                <button onClick={() => setShowApptModal(true)} className="md:hidden text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold">Novo Agendamento</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition">
                    <div className="font-bold text-lg text-slate-900 mb-1">{p.full_name}</div>
                    <div className="text-sm text-slate-500 flex flex-col gap-1">
                      <span><strong className="font-medium text-slate-700">RG:</strong> {p.rg || 'Não informado'}</span>
                      <span><strong className="font-medium text-slate-700">Fone:</strong> {p.phone || 'Não informado'}</span>
                    </div>
                  </div>
                ))}
                {patients.length === 0 && (
                  <div className="col-span-full p-8 text-center text-slate-500 text-sm">Nenhum paciente encontrado.</div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Basic Create Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Novo Agendamento</h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                  <select required value={newAppt.patient_id} onChange={e=>setNewAppt({...newAppt, patient_id: e.target.value})} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Selecione...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Médico Responsável</label>
                  <select required value={newAppt.doctor_id} onChange={e=>setNewAppt({...newAppt, doctor_id: e.target.value})} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Selecione...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Especialidade</label>
                  <select required value={newAppt.specialty_id} onChange={e=>setNewAppt({...newAppt, specialty_id: e.target.value})} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Selecione...</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input type="date" required value={newAppt.appointment_date} onChange={e=>setNewAppt({...newAppt, appointment_date: e.target.value})} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                  <input type="time" required value={newAppt.appointment_time} onChange={e=>setNewAppt({...newAppt, appointment_time: e.target.value})} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowApptModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
