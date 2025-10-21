import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const uri = import.meta.env.VITE_API_URI || 'http://localhost:3000'
axios.defaults.baseURL = uri

function Atividades() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const id = state?.turmaId || ''
  const turma = state?.nome || ''
  const professor = JSON.parse(window.localStorage.getItem('professor') ?? '{}')
  const [atividades, setAtividades] = useState<Array<{ id: number; descricao: string }>>([])

  const [open, setOpen] = useState(false)
  const [descricao, setDescricao] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!professor.id) {
      window.localStorage.removeItem('professor')
      sair()
      return
    }
    loadAtividades()
  }, [])

  function loadAtividades() {
    axios.get('/atividade/' + id)
      .then(response => { setAtividades(response.data) })
      .catch(error => {
        console.error('Erro ao buscar atividades:', error)
      })
  }

  function sair() {
    navigate('/home')
  }

  return (<>
    <header className="w-full bg-purple-600 text-white flex flex-row items-center justify-around h-16">
      <h1 className="font-bold">{professor.nome}</h1>
      <Button variant="destructive" className="bg-purple-500 hover:bg-purple-700 text-white" onClick={sair}>
        Sair
      </Button>
    </header>

    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f5f0fa' }}>
      <div className="w-full max-w-4xl space-y-4 flex flex-col align-ends">
        <div className="w-full flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
                Cadastrar atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-purple-50">
              <DialogHeader>
                <DialogTitle className="text-purple-800">Nova atividade</DialogTitle>
                <DialogDescription className="text-purple-700">
                  Informe a descrição da atividade para a turma selecionada.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const turmaId = Number(id)
                  if (!turmaId) {
                    console.error('turmaId inválido')
                    return
                  }
                  setSubmitting(true)
                  axios.post('/atividade', { descricao, turmaId })
                    .then(() => {
                      setDescricao("")
                      setOpen(false)
                      loadAtividades()
                    })
                    .catch((error) => {
                      console.error('Erro ao cadastrar atividade:', error)
                    })
                    .finally(() => setSubmitting(false))
                }}
                className="space-y-4"
              >
                <Input
                  type="text"
                  placeholder="Descrição da atividade"
                  value={descricao}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescricao(e.target.value)}
                  className="border-purple-300 focus:ring-2 focus:ring-purple-400"
                  required
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={submitting || !descricao.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300"
                  >
                    {submitting ? 'Enviando...' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <h2 className="text-purple-800 font-medium">
          <b>Turma:</b> {turma}
        </h2>

        <ul className="space-y-2">
          {atividades.map(atividade => (
            <li
              className="w-full flex justify-between space-x-2 bg-purple-100 px-4 py-2 rounded text-purple-800"
              key={atividade.id}
            >
              {atividade.id} – {atividade.descricao}
            </li>
          ))}
        </ul>
      </div>
    </main>
  </>)
}

export default Atividades
