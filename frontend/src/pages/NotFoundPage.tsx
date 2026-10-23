import { Link } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página não encontrada" />
      <Link to="/players" className="text-emerald-800 underline">
        Voltar para a lista de jogadores
      </Link>
    </>
  );
}
