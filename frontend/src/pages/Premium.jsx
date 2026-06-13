import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { premiumService } from '../services/premiumService';
import { FaSpinner } from 'react-icons/fa';

const Premium = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscribe = async (tier) => {
    if (tier === 'free') return;
    setLoadingPlan(tier);
    try {
      const response = await premiumService.createCheckoutSession(tier, billingCycle);
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Hubo un error al iniciar el pago. Por favor intenta de nuevo.");
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      description: 'Ideal para porbar la funcionalidad básica de la app.',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Hasta 15 listas (30 palabras c/u)',
        '20 Consultas al Diccionario AI/día',
        '20 Mensajes de AI diarios en chat',
        'Crea hasta 20 Compañeros AI',
        '1 Compañero AI simultáneo por chat',
        '3 Listas vinculadas al chat',
      ],
      buttonText: 'Plan Actual',
      buttonVariant: 'bg-gray-800 text-gray-300 cursor-default',
      popular: false,
    },
    {
      name: 'Pro',
      description: 'Para estudiantes que quieren aprender sin que el bot les diga "hasta mañana".',
      price: { monthly: 5.99, yearly: 49.99 },
      features: [
        'Hasta 50 listas (100 palabras c/u)',
        '100 Consultas al Diccionario AI/día',
        '100 Mensajes de AI diarios en chat',
        'Crea hasta 50 Compañeros AI',
        'Hasta 3 Compañeros AI simultáneos',
        '10 Listas vinculadas al chat',
      ],
      buttonText: 'Elegir Pro',
      buttonVariant: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105',
      popular: true,
    },
    {
      name: 'Premium',
      description: "Estudia, chatea y equivócate hasta que se te seque la garganta. Sin límites, sin remordimientos.",
      price: { monthly: 12.99, yearly: 99.99 },
      features: [
        'Listas Ilimitadas (500 palabras c/u)',
        'Diccionario AI Ilimitado*',
        'Mensajes de chat Ilimitados*',
        'Compañeros AI Ilimitados',
        'Hasta 5 Compañeros simultáneos',
        'Listas vinculadas Ilimitadas',
      ],
      buttonText: 'Eligir Premium',
      buttonVariant: 'bg-gradient-to-r from-[#00c3ff] to-blue-600 text-white hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] shadow-lg shadow-blue-500/30 transition-all hover:scale-105',
      popular: false,
    }
  ];

  const compareFeatures = [
    { label: 'Listas de Vocabulario', free: '15 Max', pro: '50 Max', premium: 'Ilimitadas' },
    { label: 'Palabras por lista', free: '30', pro: '100', premium: '500' },
    { label: 'Diccionario AI (Diario)', free: '20', pro: '100', premium: 'Ilimitado*' },
    { label: 'Diccionario Contextual (Semanal)', free: '30', pro: '150', premium: 'Ilimitado*' },
    { label: 'Análisis Gramatical (Diario)', free: '10', pro: '50', premium: 'Ilimitado*' },
    { label: 'Correcciones de Writing', free: '5', pro: '25', premium: 'Ilimitado*' },
    { label: 'Compañeros AI creados', free: '20 Max', pro: '50 Max', premium: 'Ilimitados' },
    { label: 'IAs simultáneas en chat', free: 'Solo 1', pro: 'Hasta 3', premium: 'Hasta 5' },
    { label: 'Salas de Chat', free: '15 Max', pro: '50 Max', premium: 'Ilimitadas' },
    { label: 'Mensajes AI en Chat (Diario)', free: '20', pro: '100', premium: 'Ilimitados*' },
    { label: 'Direct Mode (Voz fluida)', free: 'No Incluido', pro: '20 mensajes/día', premium: 'Ilimitado*' },
    { label: 'Rompehielos (Diario)', free: '10', pro: '50', premium: 'Ilimitados' },
    { label: 'Ayuda Pronunciación AI (Diario)', free: '30', pro: '150', premium: 'Ilimitada*' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071320] via-[#0a1f35] to-[#071320] text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00c3ff] to-white drop-shadow-sm">
            Aprende sin Barreras
          </h1>
          <p className="text-xl text-blue-200/80 max-w-2xl mx-auto font-light">
            Sube de nivel tu aprendizaje con inteligencia artificial sin interrupciones.
            Elige el plan que mejor se adapte a tus ganas de hablar.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mt-8">
            <div className="relative flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-1.5">
              <button
                className={`relative w-32 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${billingCycle === 'monthly' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                {billingCycle === 'monthly' && (
                  <span className="absolute inset-0 bg-blue-500/80 backdrop-blur-sm rounded-xl -z-10"></span>
                )}
                Mensual
              </button>
              <button
                className={`relative w-32 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${billingCycle === 'yearly' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setBillingCycle('yearly')}
              >
                {billingCycle === 'yearly' && (
                  <span className="absolute inset-0 bg-blue-500/80 backdrop-blur-sm rounded-xl -z-10"></span>
                )}
                Anual <span className="text-xs text-green-400 ml-1">-20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-3xl backdrop-blur-xl border ${plan.popular
                  ? 'bg-blue-900/20 border-blue-500/50 transform md:-translate-y-4 shadow-2xl shadow-blue-900/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                } transition-all duration-300 group`}
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full shadow-lg">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold ${plan.popular ? 'text-blue-400' : 'text-white'}`}>{plan.name}</h3>
                <p className="text-gray-400 text-sm mt-2 min-h-[60px] italic">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${plan.price[billingCycle]}
                </span>
                <span className="text-gray-400 ml-2">/mes</span>
              </div>

              {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                <p className="text-sm text-green-400 mb-6 font-medium">Facturado ${plan.price.yearly} anualmente</p>
              )}

              <button 
                className={`w-full py-4 rounded-xl font-bold text-lg mb-8 flex justify-center items-center gap-2 ${plan.buttonVariant} ${loadingPlan === plan.name.toLowerCase() ? 'opacity-70 cursor-wait' : ''}`}
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
                disabled={plan.name === 'Free' || loadingPlan}
              >
                {loadingPlan === plan.name.toLowerCase() ? <FaSpinner className="animate-spin" /> : plan.buttonText}
              </button>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">¿Qué incluye?</h4>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div className="pt-16 pb-8">
          <h2 className="text-3xl font-bold text-center mb-10 text-white">Batalla Naval de Límites</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1f35]/50 backdrop-blur-xl shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-5 text-gray-400 font-semibold text-sm uppercase tracking-wider bg-black/20 w-1/4">Característica</th>
                  <th className="p-5 font-bold text-white text-center border-l border-white/5 bg-black/10 w-1/4">Free</th>
                  <th className="p-5 font-bold text-blue-400 text-center border-l border-white/5 bg-blue-900/10 w-1/4">Pro</th>
                  <th className="p-5 font-bold text-[#00c3ff] text-center border-l border-white/5 bg-[#00c3ff]/10 w-1/4">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {compareFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-300 border-r border-white/5">{row.label}</td>
                    <td className="p-4 text-sm text-gray-400 text-center border-r border-white/5">{row.free}</td>
                    <td className="p-4 text-sm text-blue-300 text-center border-r border-white/5 font-semibold">{row.pro}</td>
                    <td className="p-4 text-sm text-[#00c3ff] text-center font-bold bg-[#00c3ff]/5">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4 italic">
            * Ilimitado sujeto a nuestra Política de Uso Justo (Fair Use) para proteger el sistema de abusos automatizados.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Premium;
