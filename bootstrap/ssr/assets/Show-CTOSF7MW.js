import { c as RequestSidebarProperties, d as RequestDescriptionCard, l as RequestDiscussionSection, m as RequestHeroHeader, o as triggerConfetti, p as RequestBlockerBanner, s as RequestSubtasksSection, t as Authenticated, u as RequestMediaGallery, y as ImageLightbox } from "./AuthenticatedLayout-C9_Pb_Sd.js";
import { Head, Link, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
//#region resources/js/Pages/Requests/Show.tsx
function Show({ request: initialRequest, projects, users, statuses, priorities, canAssign, canEdit, canComment, canUpload, canDelete }) {
	const [request, setRequest] = useState(initialRequest);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(null);
	const [lightboxSrc, setLightboxSrc] = useState(null);
	const update = async (changes) => {
		setSaving(true);
		setError(null);
		try {
			const { data } = await axios.patch(route("requests.update", request.id), changes);
			setRequest(data.request);
			if (changes.status === "done") triggerConfetti();
			toast.success("Request updated");
		} catch (err) {
			const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not save this change." : "Could not save this change.";
			setError(msg);
			toast.error(msg);
		} finally {
			setSaving(false);
		}
	};
	const addComment = async (body) => {
		if (!body.trim()) return;
		setSaving(true);
		try {
			const { data } = await axios.post(route("requests.comments.store", request.id), { body });
			setRequest(data.request);
			toast.success("Comment posted");
		} catch (err) {
			const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not add the comment." : "Could not add the comment.";
			setError(msg);
			toast.error(msg);
		} finally {
			setSaving(false);
		}
	};
	const uploadFiles = async (files) => {
		if (!files.length) return;
		setUploading(true);
		setError(null);
		const formData = new FormData();
		files.forEach((f) => formData.append("files[]", f));
		try {
			const { data } = await axios.post(route("requests.files.store", request.id), formData, { headers: { "Content-Type": "multipart/form-data" } });
			setRequest(data.request);
			toast.success(`Uploaded ${files.length} file(s)`);
		} catch (err) {
			const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not upload the files." : "Could not upload the files.";
			setError(msg);
			toast.error(msg);
		} finally {
			setUploading(false);
		}
	};
	const retry = async (fileId) => {
		try {
			const { data } = await axios.post(route("requests.files.retry", [request.id, fileId]));
			setRequest(data.request);
			toast.success("Retrying file processing");
		} catch (err) {
			const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not retry this file." : "Could not retry this file.";
			setError(msg);
			toast.error(msg);
		}
	};
	const remove = async () => {
		if (!window.confirm("Permanently delete this request, its activity, and its media? They cannot be recovered.")) return;
		await axios.delete(route("requests.destroy", request.id));
		toast.success("Request deleted");
		router.visit(route("requests.index"));
	};
	useEffect(() => {
		const handlePaste = (e) => {
			const files = Array.from(e.clipboardData?.files ?? []);
			if (files.length > 0 && canUpload) {
				e.preventDefault();
				uploadFiles(files);
				toast.info("Uploading pasted image from clipboard...");
			}
		};
		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [canUpload, request.id]);
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 text-xs",
			children: [
				/* @__PURE__ */ jsxs(Link, {
					href: route("requests.index"),
					className: "flex items-center gap-1.5 font-semibold text-zinc-400 transition-colors hover:text-white",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Work Board" })]
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] font-bold text-violet-300",
					children: ["#", request.id]
				}),
				/* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5 text-zinc-600" }),
				/* @__PURE__ */ jsx("span", {
					className: "max-w-[280px] truncate font-medium text-zinc-300 sm:max-w-md",
					children: request.title
				})
			]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: `#${request.id} · ${request.title}` }),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-6xl space-y-6",
				children: [
					error && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300 shadow-sm",
						children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 shrink-0 text-rose-400" }), /* @__PURE__ */ jsx("span", { children: error })]
					}),
					/* @__PURE__ */ jsx(RequestBlockerBanner, {
						isBlocked: request.is_blocked,
						blockedReason: request.blocked_reason,
						canEdit,
						onResolve: () => update({ is_blocked: false }),
						relations: request.relations
					}),
					/* @__PURE__ */ jsx(RequestHeroHeader, {
						request,
						canEdit,
						canDelete,
						saving,
						onUpdate: update,
						onDelete: remove
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ jsx(RequestDescriptionCard, {
									description: request.description,
									canEdit,
									onUpdate: update
								}),
								/* @__PURE__ */ jsx(RequestSubtasksSection, {
									request,
									canEdit,
									onSubtasksChange: (updated) => setRequest(updated)
								}),
								/* @__PURE__ */ jsx(RequestMediaGallery, {
									files: request.files,
									canUpload,
									uploading,
									onUploadFiles: uploadFiles,
									onRetry: retry,
									onOpenLightbox: (src) => setLightboxSrc(src)
								}),
								/* @__PURE__ */ jsx(RequestDiscussionSection, {
									activities: request.activities,
									canComment,
									saving,
									onAddComment: addComment,
									users
								})
							]
						}), /* @__PURE__ */ jsx(RequestSidebarProperties, {
							request,
							projects,
							users,
							statuses,
							priorities,
							canAssign,
							canEdit,
							onUpdate: update,
							onRequestChange: (updated) => setRequest(updated)
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(ImageLightbox, {
				src: lightboxSrc,
				onClose: () => setLightboxSrc(null)
			})
		]
	});
}
//#endregion
export { Show as default };
