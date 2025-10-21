import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
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
import axios from 'axios'

const uri = import.meta.env.VITE_API_URI || 'http://localhost:3000'
axios.defaults.baseURL = uri

function Home() {
  const navigate = useNavigate()
  const professor = JSON.parse(window.localStorage.getItem('professor') ?? '{}')
  const [turmas, setTurmas] = useState<Array<{ id: number; nome: string }>>([])
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!professor.id) {
      sair()
      return
    }
    axios.get('/turma/' + professor.id)
      .then(response => { setTurmas(response.data) })
      .catch(error => {
        console.error('Erro ao buscar turmas:', error)
      })
  }, [])

  function sair() {
    window.localStorage.removeItem('professor')
    navigate('/login')
  }

  function excluir(turmaId: number) {
    axios.delete('/turma/' + turmaId)
      .then(response => { return { status: response.status, response: response.data } })
      .then(({ status }) => {
        if (status == 204) {
          setTurmas(turmas.filter(turma => turma.id !== turmaId))
          return
        }
      })
      .catch((error) => {
        const status = error?.response?.status
        if (status === 409) {
          alert(error?.response.data?.message || 'Falha ao excluir turma.')
          return
        }
      })
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
                Cadastrar turma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-purple-50">
              <DialogHeader>
                <DialogTitle className="text-purple-800">Nova turma</DialogTitle>
                <DialogDescription className="text-purple-700">
                  Informe o nome da turma e confirme para cadastrar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                const professorId = Number(professor?.id)
                if (!professorId) {
                  alert('Professor inválido. Faça login novamente.')
                  return
                }
                setSubmitting(true)
                axios.post('/turma', { nome, professorId })
                  .then(() => {
                    setNome("")
                    setOpen(false)
                    return axios.get('/turma/' + professorId)
                  })
                  .then((response) => {
                    if (response) setTurmas(response.data)
                  })
                  .catch((error) => {
                    console.error('Erro ao cadastrar turma:', error)
                    alert(error?.response?.data?.message || 'Erro ao cadastrar turma')
                  })
                  .finally(() => setSubmitting(false))
              }} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nome da turma"
                  value={nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                  className="border-purple-300 focus:ring-2 focus:ring-purple-400"
                  required
                />
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !nome.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
                    {submitting ? 'Enviando...' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <h2 className='font-bold text-purple-800'>Turmas</h2>
        <ul className="space-y-2">
          {turmas.map(turma => (
            <li className="w-full flex justify-between items-center space-x-2 bg-purple-100 px-4 py-2 rounded text-purple-800" key={turma.id}>
              <span>{turma.id} — {turma.nome}</span>
              <div className="flex space-x-2">
                <Button
                  className="bg-red-400 hover:bg-red-500 text-white"
                  onClick={() => excluir(turma.id)}>
                  Excluir
                </Button>
                <Button
                  className="bg-purple-500 hover:bg-purple-700 text-white"
                  onClick={() => {
                    navigate('/atividades', {
                      state: { turmaId: turma.id, nome: turma.nome }
                    })
                  }}>
                  Visualizar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  </>)
}

export default Home
