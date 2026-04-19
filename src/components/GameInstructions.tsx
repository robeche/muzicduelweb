"use client";

import { useState } from "react";

export function GameInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        ¿Cómo se juega?
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>🎵</span> Instrucciones del Juego
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6 text-slate-300">
              {/* Preparación */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center text-sm">1</span>
                  Preparación del Juego
                </h3>
                <div className="space-y-3 pl-9">
                  <div>
                    <p className="font-medium text-white mb-1">Equipos</p>
                    <p className="text-sm">Dividir a los participantes en <strong className="text-white">dos equipos</strong>.</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Línea del tiempo</p>
                    <p className="text-sm">Cada equipo dibujará en un papel una <strong className="text-white">línea del tiempo</strong> con las siguientes marcas:</p>
                    <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
                      <li>Extremo izquierdo: <strong className="text-cyan-300">1960</strong></li>
                      <li>Extremo derecho: <strong className="text-purple-300">2025</strong></li>
                      <li>Punto medio aproximado: <strong className="text-amber-300">2000</strong></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Material necesario</p>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li><strong className="text-white">3 comodines por equipo</strong>: pueden ser cartas, trozos de papel o incluso galletas</li>
                      <li><strong className="text-white">Marcadores de posición</strong>: un cuenco con garbanzos, bolitas, fichas o similar</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Desarrollo */}
              <section>
                <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-purple-400/20 flex items-center justify-center text-sm">2</span>
                  Desarrollo del Turno
                </h3>
                <div className="space-y-3 pl-9">
                  <div>
                    <p className="font-medium text-white mb-1">Escuchar la canción</p>
                    <p className="text-sm">El equipo con el turno reproduce una canción desde la aplicación. Todos escuchan atentamente.</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Colocar el marcador</p>
                    <p className="text-sm">El equipo debe colocar un <strong className="text-white">garbanzo o marcador</strong> en su línea del tiempo, estimando el año de lanzamiento de la canción.</p>
                    <p className="text-sm text-slate-400 mt-1 italic">💡 En el primer turno será sencillo: solo hay que decidir si es antes o después del año 2000.</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Desafío del equipo rival</p>
                    <p className="text-sm">Si el equipo contrario cree que la colocación es <strong className="text-white">incorrecta</strong>, puede <strong className="text-amber-300">arriesgar uno de sus comodines</strong> colocándolo donde considere que debería estar el marcador.</p>
                  </div>
                </div>
              </section>

              {/* Resolución */}
              <section>
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center text-sm">3</span>
                  Resolución y Puntuación
                </h3>
                <div className="space-y-3 pl-9">
                  <div>
                    <p className="font-medium text-white mb-1">Revelar la respuesta</p>
                    <p className="text-sm">Se pulsa &quot;Revelar canción&quot; para mostrar el título, artista y año real.</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Verificación del orden cronológico</p>
                    <p className="text-sm">El marcador es <strong className="text-green-300">válido</strong> si está correctamente ordenado respecto a los marcadores ya colocados (no necesita estar en el año exacto, solo en el orden correcto).</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Resultado del desafío</p>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li>Si el equipo rival acertó en su desafío: <strong className="text-green-300">recupera su comodín + el marcador del turno</strong></li>
                      <li>Si el equipo rival se equivocó: <strong className="text-red-300">pierde el comodín apostado</strong></li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Bonus */}
              <section>
                <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-sm">⭐</span>
                  Bonus: Adivinar Título y Artista
                </h3>
                <div className="space-y-3 pl-9">
                  <p className="text-sm">Además de acertar la posición temporal, los equipos pueden intentar adivinar el <strong className="text-white">título y artista</strong> de la canción (o la <strong className="text-white">película</strong> si se juega con temática de cine).</p>
                  
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <p className="font-medium text-amber-300 mb-2">Reglas del bonus:</p>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li>El <strong className="text-white">equipo con el turno tiene preferencia</strong> para responder</li>
                      <li>El equipo rival debe <strong className="text-white">permanecer en silencio</strong> mientras el equipo con el turno delibera</li>
                      <li>Solo cuando el equipo con el turno se rinda, el rival puede intentarlo</li>
                      <li>Acertar otorga <strong className="text-green-300">un comodín extra</strong> (¡si usáis galletas, podéis comérosla!)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Victoria */}
              <section>
                <h3 className="text-lg font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-pink-400/20 flex items-center justify-center text-sm">🏆</span>
                  Victoria
                </h3>
                <div className="pl-9">
                  <p className="text-sm">El juego puede terminar de varias formas:</p>
                  <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
                    <li>Tras un <strong className="text-white">número acordado de rondas</strong>: gana quien tenga más marcadores correctamente colocados</li>
                    <li>Por <strong className="text-white">eliminación de comodines</strong>: si un equipo pierde todos sus comodines y falla una colocación</li>
                    <li>Gana el equipo que consiga <strong className="text-white">10 marcadores correctos</strong> primero</li>
                  </ul>
                </div>
              </section>

              {/* Tips */}
              <section className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">💡 Consejos</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Usa el <strong className="text-white">filtro de años</strong> para ajustar la dificultad según el conocimiento del grupo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Combina <strong className="text-white">varios estilos musicales</strong> para mayor variedad.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">•</span>
                    <span>En móvil se reproduce un <strong className="text-white">preview de 30 segundos</strong>. Para escuchar la canción completa, usa el botón de YouTube.</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
