import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Termos de Uso' };

export default function TermsPage() {
  return (
    <article>
      <h1>Termos de Uso</h1>
      <p className="meta">Última atualização: novembro de 2026</p>

      <p>
        Estes Termos regulam o uso do MusicOS (&quot;Serviço&quot;), uma plataforma de estudo de teoria musical. Ao usar o
        Serviço, você concorda com estes Termos. Se não concordar, não utilize o Serviço.
      </p>

      <h2>1. O Serviço</h2>
      <p>
        O MusicOS oferece ferramentas interativas de estudo musical: escalas, campo harmônico, diagramas de acordes, braço
        de instrumentos, metrônomo, afinador e exercícios. Parte dos recursos é gratuita e não exige cadastro; outros
        recursos (&quot;Pro&quot;) exigem conta e plano pago.
      </p>

      <h2>2. Conta</h2>
      <ul>
        <li>Você é responsável por manter a confidencialidade da sua senha e por toda atividade na sua conta.</li>
        <li>Informe dados verdadeiros. Uma conta é pessoal e não pode ser compartilhada.</li>
        <li>É preciso ter 18 anos ou autorização de um responsável para contratar um plano pago.</li>
      </ul>

      <h2>3. Planos e pagamento</h2>
      <ul>
        <li>
          <strong>Pro Mensal e Pro Anual</strong> são assinaturas renovadas automaticamente ao fim de cada período, pelo
          preço vigente, até que você cancele.
        </li>
        <li>
          <strong>Vitalício</strong> é um pagamento único que dá acesso aos recursos Pro enquanto o Serviço existir,
          incluindo atualizações futuras.
        </li>
        <li>Os pagamentos são processados pelo Stripe. Não armazenamos dados de cartão.</li>
        <li>Os preços podem mudar; mudanças em assinaturas ativas são avisadas com antecedência por e-mail.</li>
      </ul>

      <h2>4. Cancelamento e reembolso</h2>
      <ul>
        <li>
          Você pode cancelar uma assinatura a qualquer momento em &quot;Minha conta&quot;. O acesso Pro continua até o fim
          do período já pago e não há renovação.
        </li>
        <li>
          <strong>Garantia de 7 dias:</strong> em qualquer plano pago, você pode pedir reembolso integral em até 7 dias
          após a primeira compra, pelo e-mail suporte@musicos.app, conforme o Código de Defesa do Consumidor.
        </li>
      </ul>

      <h2>5. Uso aceitável</h2>
      <p>
        É proibido copiar, redistribuir, revender ou fazer engenharia reversa do Serviço, bem como usar meios automatizados
        para extrair seu conteúdo. Podemos suspender contas que violem estes Termos.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        O MusicOS, sua marca, código e conteúdo pertencem aos seus criadores. O conteúdo que você gera (por exemplo,
        pontuações de exercícios) é seu.
      </p>

      <h2>7. Disponibilidade e responsabilidade</h2>
      <p>
        Trabalhamos para manter o Serviço disponível, mas ele é fornecido &quot;como está&quot;. Não nos responsabilizamos
        por indisponibilidades, perda de dados locais do navegador ou por decisões tomadas com base no conteúdo educativo.
      </p>

      <h2>8. Alterações</h2>
      <p>
        Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas no Serviço ou por e-mail. O uso continuado
        após a mudança significa aceitação.
      </p>

      <h2>9. Contato</h2>
      <p>
        Dúvidas: <a href="mailto:suporte@musicos.app">suporte@musicos.app</a>. Veja também nossa{' '}
        <Link href="/privacy">Política de Privacidade</Link>.
      </p>
    </article>
  );
}
