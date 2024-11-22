import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaClipboardList, FaSignOutAlt, FaPlus, FaChartBar } from 'react-icons/fa';
import styles from './home.module.css';

function Home({ user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [livros, setLivros] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [activeSection, setActiveSection] = useState('livros');
  const [novoLivro, setNovoLivro] = useState({ titulo: '', autor: '', disponiveis: 0 });
  const [activeTab, setActiveTab] = useState('add');
  const [livroEditado, setLivroEditado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Carrega as reservas
    axios
      .get('http://localhost:5501/reservas')
      .then((response) => {
        const reservasAdaptadas = response.data.map((reserva) => ({
          ...reserva,
          livroIds: reserva.livroId.split(','), // Converte a string para um array para fazer a contagem
        }));
        setReservas(reservasAdaptadas);
      })
      .catch((error) => console.error('Erro ao carregar reservas:', error));

    // Carrega os livros
    axios
      .get('http://localhost:5501/livros')
      .then((response) => setLivros(response.data))
      .catch((error) => console.error('Erro ao carregar os livros:', error));

    // Carrega os usuários
    axios
      .get('http://localhost:5501/usuarios')
      .then((response) => setUsuarios(response.data))
      .catch((error) => console.error('Erro ao carregar usuários:', error));
  }, []);


  const livrosMaisReservados = livros.map((livro) => {
    const reservasDoLivro = reservas.filter((reserva) => reserva.livroIds.includes(livro.id));
    return {
      ...livro,
      reservas: reservasDoLivro.length,
    };
  }).sort((a, b) => b.reservas - a.reservas);

  const totalReservas = reservas.reduce((total, reserva) => {
    return total + reserva.livroIds.length;
  }, 0);
  const switchSection = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const iniciarEdicao = (livro) => {
    setLivroEditado(livro);
    setActiveTab('edit');
  };

  const salvarEdicao = (e) => {
    e.preventDefault();
    axios
      .patch(`http://localhost:5501/livros/${livroEditado.id}`, livroEditado)
      .then((response) => {
        setLivros((prevLivros) =>
          prevLivros.map((livro) =>
            livro.id === livroEditado.id ? response.data : livro
          )
        );
        setLivroEditado(null);
        setActiveTab('manage');
        alert('Livro editado com sucesso!');
      })
      .catch((error) => console.error('Erro ao salvar edição:', error));
  };

  const removerLivro = (id) => {
    if (window.confirm('Tem certeza que deseja remover este livro?')) {
      axios
        .delete(`http://localhost:5501/livros/${id}`)
        .then(() => {
          setLivros((prevLivros) => prevLivros.filter((livro) => livro.id !== id));
          alert('Livro removido com sucesso!');
        })
        .catch((error) => console.error('Erro ao remover livro:', error));
    }
  };

  const adicionarLivro = (e) => {
    e.preventDefault();
    if (!novoLivro.titulo || !novoLivro.autor || novoLivro.disponiveis <= 0) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    axios
      .post('http://localhost:5501/livros', novoLivro)
      .then((response) => {
        setLivros((prevLivros) => [...prevLivros, response.data]);
        setNovoLivro({ titulo: '', autor: '', disponiveis: 0 });
        alert('Livro adicionado com sucesso!');
      })
      .catch((error) => console.error('Erro ao adicionar livro:', error));
  };

  const reservarLivro = async (livroId) => {
    if (!user || user.role !== 'user') {
      alert('Apenas usuários comuns podem reservar livros.');
      return;
    }
  
    const livro = livros.find((livro) => livro.id === livroId);
    if (!livro) {
      alert('Livro não encontrado.');
      return;
    }
  
    if (livro.tipo === 'fisico' && livro.disponiveis <= 0) {
      alert('Livro indisponível.');
      return;
    }
  
    try {
      const reservasDoUsuario = reservas.find((reserva) => reserva.userId === user.id);
  
      if (reservasDoUsuario) {
        // Atualiza reserva existente
        const novosLivros = [...new Set([...reservasDoUsuario.livroIds, livroId])];
        await axios.patch(`http://localhost:5501/reservas/${reservasDoUsuario.id}`, {
          livroId: novosLivros.join(','),
        });
  
        setReservas((prev) =>
          prev.map((reserva) =>
            reserva.id === reservasDoUsuario.id
              ? { ...reserva, livroIds: novosLivros }
              : reserva
          )
        );
      } else {
        // Cria nova reserva
        const novaReserva = {
          id: Date.now().toString(),
          userId: user.id,
          livroId,
          data: new Date().toISOString(),
        };
  
        await axios.post('http://localhost:5501/reservas', novaReserva);
  
        setReservas((prev) => [
          ...prev,
          { ...novaReserva, livroIds: [livroId] },
        ]);
      }
  
      // Atualiza o número de reservas no livro
      await axios.patch(`http://localhost:5501/livros/${livroId}`, {
        reservas: livro.reservas + 1,
        disponiveis: livro.tipo === 'fisico' ? livro.disponiveis - 1 : livro.disponiveis,
      });
  
      setLivros((prev) =>
        prev.map((livro) =>
          livro.id === livroId
            ? {
                ...livro,
                reservas: livro.reservas + 1,
                disponiveis: livro.tipo === 'fisico' ? livro.disponiveis - 1 : livro.disponiveis,
              }
            : livro
        )
      );
  
      alert('Livro reservado com sucesso!');
    } catch (error) {
      console.error('Erro ao reservar o livro:', error.response || error.message);
      alert('Ocorreu um erro ao reservar o livro.');
    }
  };
  


  const livrosFiltrados = livros.filter(
    (livro) =>
      livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const JaFoiReservado = (livroId) => {
    return reservas.some((reserva) => reserva.userId === user.id && reserva.livroIds.includes(livroId));
  };


  return (
    <div className={styles.container}>
      {/*Topo com a  mavbar */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="Logo BiblioTech" className={styles.logo} />
          <h1 className={styles.siteName}>BiblioTech</h1>
        </div>

        {/* Navbar */}
        <nav className={styles.navbar}>
          <button
            className={`${styles.navbarButton} ${activeSection === 'livros' ? styles.active : ''}`}
            onClick={() => switchSection('livros')}
          >
            <FaBook className={styles.navbarIcon} />
            Livros
          </button>
          {user?.role === 'user' && (
            <button
              className={`${styles.navbarButton} ${activeSection === 'reservas' ? styles.active : ''}`}
              onClick={() => switchSection('reservas')}
            >
              <FaClipboardList className={styles.navbarIcon} />
              Reservas
            </button>
          )}
          {user?.role === 'admin' && (
            <>
              <button
                className={`${styles.navbarButton} ${activeSection === 'adicionar' ? styles.active : ''}`}
                onClick={() => switchSection('adicionar')}
              >
                <FaPlus className={styles.navbarIcon} />
                Adicionar
              </button>
              <button
                className={`${styles.navbarButton} ${activeSection === 'relatorios' ? styles.active : ''}`}
                onClick={() => switchSection('relatorios')}
              >
                <FaChartBar className={styles.navbarIcon} />
                Relatórios
              </button>
            </>
          )}

          <button className={`${styles.navbarButton} ${styles.logoutButton}`} onClick={handleLogout}>
            <FaSignOutAlt className={styles.navbarIcon} />
            Logout
          </button>
        </nav>
      </header>

      {/* "Quem somos" */}
      {activeSection === 'about' && (
        <section className={styles.about}>
          <div className={styles.aboutContent}>
            <h1>Sobre a BiblioTech</h1>
            <p>
              Bem-vindo à <strong>BiblioTech</strong>, a maior plataforma digital de leitura da América Latina!
              Nossa missão é conectar leitores aos melhores títulos, proporcionando acesso a mais de <strong>50.000 livros</strong>
              em diversas áreas, desde ficção e ciência até autoajuda e educação.
            </p>
            <p>
              Com mais de <strong>5 milhões de usuários cadastrados</strong>, a BiblioTech é pioneira em oferecer uma experiência
              personalizada, intuitiva e acessível para leitores de todas as idades. Trabalhamos com mais de <strong>1.200 editoras parceiras</strong>
              para garantir a diversidade e qualidade de nosso acervo.
            </p>

            {/* Estatisticas */}
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <h2>+50.000</h2>
                <p>Livros no catálogo</p>
              </div>
              <div className={styles.statCard}>
                <h2>+5M</h2>
                <p>Usuários cadastrados</p>
              </div>
              <div className={styles.statCard}>
                <h2>+1.200</h2>
                <p>Editoras parceiras</p>
              </div>
              <div className={styles.statCard}>
                <h2>+15</h2>
                <p>Países atendidos</p>
              </div>
            </div>

            <p>
              Na BiblioTech, você também pode salvar seus livros favoritos, compartilhar suas leituras com amigos e
              explorar nossa biblioteca interativa, que oferece recomendações personalizadas com base no seu perfil de leitura.
            </p>

            {/* Diferenciais */}
            <div className={styles.differentials}>
              <h2>Nossos Diferenciais</h2>
              <ul>
                <li>Acesso a uma biblioteca global 24 horas por dia, 7 dias por semana.</li>
                <li>Ferramentas avançadas de busca para encontrar o livro perfeito.</li>
                <li>Compatível com dispositivos móveis, tablets e desktops.</li>
                <li>Plano gratuito para estudantes de escolas públicas.</li>
                <li>Recomendações personalizadas baseadas em suas leituras.</li>
              </ul>
            </div>

            {/* Envolver o cliente */}
            <div className={styles.callToAction}>
              <h2>Junte-se à Comunidade BiblioTech!</h2>
              <p>
                Descubra uma nova forma de explorar o conhecimento.
                Faça parte da revolução digital da leitura e conecte-se ao mundo dos livros agora mesmo!
              </p>
              <button className={styles.heroButton} onClick={() => switchSection('livros')}>
                Explore Livros
              </button>
            </div>
          </div>
        </section>
      )}


      {/* Seção hero */}
      {activeSection === 'livros' && (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Bem-vindo à <span>BiblioTech</span></h1>
            <p>Explore nossa coleção com milhares de eBooks para enriquecer sua leitura e conhecimento.</p>
            <button className={styles.heroButton} onClick={() => switchSection('about')}>
              Conheça Mais
            </button>
          </div>
          <div className={styles.heroImage}>
            <img src="/assets/hero-image.png" alt="Imagem representando leitura" />
          </div>
        </section>
      )}
      {/* Seção Relatorios */}
      {activeSection === 'relatorios' && user?.role === 'admin' && (
        <section className={styles.centeredHero}>
          <div className={styles.reportsContent}>
            <h1 className={styles.reportsTitle}>Relatórios da Biblioteca</h1>

            {/* Estatisticas gerais */}
            <div className={styles.reportsStatsContainer}>
              <div className={styles.reportsStatCard}>
                <h2>{usuarios.length}</h2>
                <p>Usuários Cadastrados</p>
              </div>
              <div className={styles.reportsStatCard}>
                <h2>{totalReservas}</h2>
                <p>Total de Reservas</p>
              </div>
              <div className={styles.reportsStatCard}>
                <h2>{livros.length}</h2>
                <p>Livros no Catálogo</p>
              </div>
            </div>

            {/* Livros mais reservados */}
            <div className={styles.reportsTableContainer}>
              <h2 className={styles.reportsTableTitle}>Livros Mais Reservados</h2>
              <table className={styles.reportsTable}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Reservas</th>
                  </tr>
                </thead>
                <tbody>
                  {livrosMaisReservados.map((livro) => (
                    <tr key={livro.id}>
                      <td>{livro.titulo}</td>
                      <td>{livro.autor || 'Desconhecido'}</td>
                      <td>{livro.reservas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Seção livros */}
      {activeSection === 'livros' && (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Explore nossos livros disponíveis</h1>
            <div className={styles.searchContainer}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className={styles.searchBox}
              >
                <input
                  type="text"
                  placeholder="Pesquise por título ou autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  <FaBook className={styles.lupaIcon} />
                </button>
              </form>
            </div>
            <div className={styles.booksContainer}>
              {livrosFiltrados.map((livro) => {
                const jaReservado = JaFoiReservado(livro.id); // Verifica se o livro já foi reservado
                const indisponivel = livro.tipo === 'fisico' && livro.disponiveis <= 0;

                return (
                  <div
                    key={livro.id}
                    className={`${styles.bookCard} ${indisponivel ? styles.bookUnavailable : ''}`}
                  >
                    <img src={livro.capaUrl} alt={livro.titulo} className={styles.bookImage} />
                    <h3 className={styles.bookTitle}>{livro.titulo}</h3>
                    <p className={styles.bookAuthor}>{livro.autor}</p>
                    <p className={styles.bookAvailability}>
                      {indisponivel ? 'Indisponível' : `Disponíveis: ${livro.disponiveis}`}
                    </p>
                    <button
                      className={`${styles.reserveButton} ${indisponivel || jaReservado ? styles.disabledButton : ''
                        }`}
                      onClick={() => !indisponivel && !jaReservado && reservarLivro(livro.id)}
                      disabled={indisponivel || jaReservado}
                    >
                      {jaReservado ? 'Já Reservado' : 'Reservar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {/* Seção reservas */}
      {activeSection === 'reservas' && user?.role === 'user' && (
  <section className={styles.hero}>
    <div className={styles.heroContent}>
      <h1>Suas Reservas</h1>
      <div className={styles.booksContainer}>
        {reservas
          .filter((reserva) => reserva.userId === user.id) // Filtra as reservas do usuário
          .flatMap((reserva) => reserva.livroIds.map((livroId) => livros.find((livro) => livro.id === livroId)))
          .filter((livro) => livro) // Remove livros que não foram encontrados
          .map((livro) => (
            <div key={livro.id} className={styles.bookCard}>
              <h3 className={styles.bookTitle}>{livro.titulo}</h3>
              <p className={styles.bookAuthor}>{livro.autor}</p>
              <p className={styles.reservationDate}>
                Reservado em: {new Date(reservas.find((reserva) => reserva.livroIds.includes(livro.id)).data).toLocaleDateString()}
              </p>

              {livro.tipo === 'fisico' ? (
                <p className={styles.bookAddress}>
                  Retirada em:{" "}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(livro.endereco)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapsLink}
                  >
                    {livro.endereco}
                  </a>
                </p>
              ) : (
                <a
                  href={livro.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ebookLink}
                >
                  Acessar Ebook
                </a>
              )}
            </div>
          ))}
      </div>
    </div>
  </section>
)}




      {/* Seção adicionar livros */}
      {activeSection === 'adicionar' && user?.role === 'admin' && (
        <section className={styles.centeredHero}>
          <div className={styles.heroContent}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
                onClick={() => setActiveTab('add')}
              >
                Adicionar Livro
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'manage' ? styles.active : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                Gerenciar Livros
              </button>
            </div>

            {activeTab === 'add' && (
              <form onSubmit={adicionarLivro} className={styles.addBookForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="titulo">Título do Livro</label>
                  <input
                    id="titulo"
                    type="text"
                    placeholder="Digite o título do livro"
                    value={novoLivro.titulo}
                    onChange={(e) => setNovoLivro({ ...novoLivro, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="autor">Autor do Livro</label>
                  <input
                    id="autor"
                    type="text"
                    placeholder="Digite o nome do autor"
                    value={novoLivro.autor}
                    onChange={(e) => setNovoLivro({ ...novoLivro, autor: e.target.value })}
                    required
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.selectGroup}`}>
                  <label htmlFor="tipo">Tipo do Livro</label>
                  <select
                    id="tipo"
                    value={novoLivro.tipo || ''}
                    onChange={(e) => setNovoLivro({ ...novoLivro, tipo: e.target.value })}
                    required
                  >
                    <option value="">Selecione o Tipo</option>
                    <option value="fisico">Físico</option>
                    <option value="ebook">Ebook</option>
                  </select>
                </div>

                {novoLivro.tipo === 'fisico' && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="disponiveis">Quantidade Disponível</label>
                      <input
                        id="disponiveis"
                        type="number"
                        placeholder="Digite a quantidade disponível"
                        value={novoLivro.disponiveis}
                        onChange={(e) => setNovoLivro({ ...novoLivro, disponiveis: Number(e.target.value) })}
                        required
                        min="1"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="endereco">Endereço para Retirada</label>
                      <input
                        id="endereco"
                        type="text"
                        placeholder="Digite o endereço para retirada"
                        value={novoLivro.endereco || ''}
                        onChange={(e) => setNovoLivro({ ...novoLivro, endereco: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {novoLivro.tipo === 'ebook' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="link">Link para Acesso</label>
                    <input
                      id="link"
                      type="url"
                      placeholder="Digite o link do ebook"
                      value={novoLivro.link || ''}
                      onChange={(e) => setNovoLivro({ ...novoLivro, link: e.target.value })}
                      required
                    />
                  </div>
                )}

                <button type="submit" className={styles.addBookButton}>
                  Adicionar
                </button>
              </form>
            )}

            {activeTab === 'manage' && (
              <div className={styles.tableContainer}>
                <table>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Autor</th>
                      <th>Tipo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livros.map((livro) => (
                      <tr key={livro.id}>
                        <td>{livro.titulo}</td>
                        <td>{livro.autor}</td>
                        <td>{livro.tipo === 'fisico' ? 'Físico' : 'Ebook'}</td>
                        <td className={styles.actionButtons}>
                          <button className={styles.editButton} onClick={() => iniciarEdicao(livro)}>
                            Editar
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => removerLivro(livro.id)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'edit' && livroEditado && (
              <section className={styles.centeredSection}>
                <div className={styles.editBookContainer}>
                  <h1 className={styles.editBookTitle}>Editar Livro</h1>
                  <form onSubmit={salvarEdicao} className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="titulo">Título do Livro</label>
                      <input
                        id="titulo"
                        type="text"
                        value={livroEditado.titulo}
                        onChange={(e) => setLivroEditado({ ...livroEditado, titulo: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="autor">Autor</label>
                      <input
                        id="autor"
                        type="text"
                        value={livroEditado.autor}
                        onChange={(e) => setLivroEditado({ ...livroEditado, autor: e.target.value })}
                        required
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.selectGroup}`}>
                      <label htmlFor="tipo">Tipo do Livro</label>
                      <select
                        id="tipo"
                        value={livroEditado.tipo || ''}
                        onChange={(e) => setLivroEditado({ ...livroEditado, tipo: e.target.value })}
                        required
                      >
                        <option value="">Selecione o Tipo</option>
                        <option value="fisico">Físico</option>
                        <option value="ebook">Ebook</option>
                      </select>
                    </div>

                    {/* livro fisico */}
                    {livroEditado.tipo === 'fisico' && (
                      <>
                        <div className={styles.formGroup}>
                          <label htmlFor="disponiveis">Quantidade Disponível</label>
                          <input
                            id="disponiveis"
                            type="number"
                            value={livroEditado.disponiveis || 0}
                            onChange={(e) =>
                              setLivroEditado({ ...livroEditado, disponiveis: Number(e.target.value) })
                            }
                            required
                            min="1"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="endereco">Endereço para Retirada</label>
                          <input
                            id="endereco"
                            type="text"
                            value={livroEditado.endereco || ''}
                            onChange={(e) => setLivroEditado({ ...livroEditado, endereco: e.target.value })}
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* ebook */}
                    {livroEditado.tipo === 'ebook' && (
                      <div className={styles.formGroup}>
                        <label htmlFor="link">Link para Acesso</label>
                        <input
                          id="link"
                          type="url"
                          value={livroEditado.link || ''}
                          onChange={(e) => setLivroEditado({ ...livroEditado, link: e.target.value })}
                          required
                        />
                      </div>
                    )}

                    <div className={styles.buttonGroup}>
                      <button type="submit" className={styles.saveButton}>Salvar Alterações</button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setActiveTab('manage')}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </div>
        </section>
      )}


    </div>
  );
}

export default Home;
