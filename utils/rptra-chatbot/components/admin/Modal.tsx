// import React from "react";
// import { X } from "lucide-react";
// import { VisitFormData, ModalMode } from "@/types/types";

// interface ModalProps {
//   mode: ModalMode;
//   formData: VisitFormData;
//   formError: string | null;
//   isSubmitting: boolean;
//   onClose: () => void;
//   onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onSubmit: (e: React.FormEvent) => void;
// }

// export function Modal({
//   mode,
//   formData,
//   formError,
//   isSubmitting,
//   onClose,
//   onFormChange,
//   onSubmit,
// }: ModalProps) {
//   const title = mode === "create" ? "Tambah Data Kunjungan Baru" : "Edit Data Kunjungan";

//   return (
//     <div
//       className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="modal-title"
//     >
//       <div className="bg-white rounded-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-xl">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-2xl flex items-center justify-between">
//           <h2 id="modal-title" className="text-2xl font-bold">
//             {title}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-white/70 hover:text-white transition-colors p-1"
//             aria-label="Tutup modal"
//             disabled={isSubmitting}
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <form onSubmit={onSubmit} className="p-6 space-y-6" noValidate>
//           {formError && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
//               {formError}
//             </div>
//           )}

//           <div>
//             <label htmlFor="date" className="block font-semibold mb-1">
//               Tanggal <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="date"
//               id="date"
//               name="date"
//               value={formData.date}
//               onChange={onFormChange}
//               required
//               disabled={isSubmitting}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label htmlFor="time" className="block font-semibold mb-1">
//               Waktu <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="time"
//               id="time"
//               name="time"
//               value={formData.time}
//               onChange={onFormChange}
//               required
//               disabled={isSubmitting}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             {["anak", "balita", "dewasa", "lansia", "remaja"].map((key) => (
//               <div key={key}>
//                 <label htmlFor={key} className="block font-semibold mb-1 capitalize">
//                   {key}
//                 </label>
//                 <input
//                   type="number"
//                   id={key}
//                   name={key}
//                   min={0}
//                   value={formData[key as keyof VisitFormData]}
//                   onChange={onFormChange}
//                   disabled={isSubmitting}
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
//                 />
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-end gap-4 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
//             >
//               Batal
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
//             >
//               {isSubmitting ? "Menyimpan..." : "Simpan"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
