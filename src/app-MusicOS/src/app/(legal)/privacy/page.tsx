import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Política de Privacidade' };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Política de Privacidade</h1>
      <p className="meta">Última atualização: novembro de 2026 · Em conformidade com a LGPD (Lei 13.709/2018)</p>

      <p>
        Esta Política explica quais dados o MusicOS coleta, por que e como você pode exercer seus direitos. Usamos o mínimo
        necessário para o Serviço funcionar.
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Modo grátis (sem conta):</strong> nenhum dado pessoal. Preferências e pontuações de exercícios ficam
          apenas no seu navegador (localStorage).
        </li>
        <li>
          <strong>Conta:</strong> nome, e-mail e, se usar o login com Google, o avatar fornecido pelo Google.
        </li>
        <li>
          <strong>Pagamento:</strong> o Stripe processa o pagamento e nos informa apenas o status do plano e um
          identificador de cliente. Não recebemos nem guardamos número de cartão.
        </li>
        <li>
          <strong>Técnicos:</strong> registros de erro do servidor (sem conteúdo pessoal além do necessário para
          diagnóstico).
        </li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Autenticar você e manter sua sessão.</li>
        <li>Liberar os recursos do plano contratado.</li>
        <li>Enviar e-mails transacionais: confirmação de conta, redefinição de senha, recibos e avisos de cobrança.</li>
        <li>Atender pedidos de suporte.</li>
      </ul>
      <p>Não vendemos dados e não enviamos e-mails de marketing sem seu consentimento.</p>

      <h2>3. Com quem compartilhamos</h2>
      <ul>
        <li>
          <strong>Supabase</strong> — hospedagem do banco de dados e autenticação.
        </li>
        <li>
          <strong>Stripe</strong> — processamento de pagamentos.
        </li>
        <li>
          <strong>Google</strong> — apenas se você optar pelo login com Google.
        </li>
      </ul>

      <h2>4. Afinador e microfone</h2>
      <p>
        O afinador processa o áudio do microfone localmente, no seu dispositivo. Nenhum áudio é gravado ou enviado aos
        nossos servidores. A permissão pode ser revogada a qualquer momento no navegador.
      </p>

      <h2>5. Ranking dos exercícios</h2>
      <p>
        Assinantes que fazem os exercícios aparecem no ranking semanal e mensal com o primeiro nome e a inicial do sobrenome,
        a pontuação e o percentual de acerto. E-mail e outros dados nunca são exibidos. Você pode sair do ranking a qualquer
        momento desmarcando &quot;Aparecer no ranking&quot; na aba Ranking.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Usamos apenas cookies estritamente necessários para manter você logado. Não usamos cookies de rastreamento de
        terceiros.
      </p>

      <h2>7. Seus direitos (LGPD)</h2>
      <p>
        Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, e revogar consentimentos, pelo
        e-mail <a href="mailto:suporte@musicos.app">suporte@musicos.app</a>. Respondemos em até 15 dias. Ao excluir a
        conta, seus dados pessoais são apagados; registros fiscais de pagamento são mantidos pelo prazo legal.
      </p>

      <h2>8. Segurança e retenção</h2>
      <p>
        Dados trafegam criptografados (HTTPS) e ficam em provedores com certificações de segurança. Mantemos seus dados
        enquanto a conta existir.
      </p>

      <h2>9. Alterações</h2>
      <p>Mudanças relevantes nesta Política serão comunicadas no Serviço ou por e-mail.</p>

      <p>
        Veja também os <Link href="/terms">Termos de Uso</Link>.
      </p>
    </article>
  );
}
