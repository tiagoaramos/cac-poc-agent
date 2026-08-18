import { UauInsumo } from "@/lib/uau/types";

export default function InsumoTable({ insumos }: { insumos: UauInsumo[] }) {
  if (insumos.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nenhum insumo retornado para esta obra.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Descrição</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Unidade</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((insumo) => (
            <tr key={insumo.codigo} className="border-t border-slate-100">
              <td className="px-4 py-3 font-mono text-xs text-slate-700">
                {insumo.codigo}
              </td>
              <td className="px-4 py-3 text-slate-800">{insumo.descricao}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {insumo.categoria} · {insumo.categoriaDescricao}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{insumo.unidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
