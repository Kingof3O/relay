import { b as ImageLightbox, c as RequestSubtasksSection, d as RequestMediaGallery, f as RequestDescriptionCard, h as RequestHeroHeader, l as RequestSidebarProperties, m as RequestBlockerBanner, o as triggerConfetti, s as RequestPullRequestsSection, t as Authenticated, u as RequestDiscussionSection } from "./AuthenticatedLayout-KgOcAsfl.js";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ChevronRight, RefreshCw } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
//#region resources/js/Components/LivePresenceAvatars.tsx
var AVATAR_COLORS = [
	"from-violet-500 to-indigo-600",
	"from-emerald-500 to-teal-600",
	"from-cyan-500 to-blue-600",
	"from-amber-500 to-orange-600",
	"from-pink-500 to-rose-600"
];
function LivePresenceAvatars({ requestId, className = "" }) {
	const authUser = usePage().props.auth?.user;
	const [viewers, setViewers] = useState(() => {
		if (!authUser) return [];
		return [{
			id: authUser.id,
			name: authUser.name,
			username: authUser.username,
			color: AVATAR_COLORS[authUser.id % AVATAR_COLORS.length]
		}];
	});
	useEffect(() => {
		if (typeof window === "undefined") return;
		const echo = window.Echo;
		if (!echo) return;
		try {
			const channel = echo.join(`request.${requestId}`);
			channel.here((users) => {
				setViewers(users.map((u, i) => ({
					...u,
					color: AVATAR_COLORS[(u.id ?? i) % AVATAR_COLORS.length]
				})));
			});
			channel.joining((user) => {
				setViewers((prev) => {
					if (prev.some((u) => u.id === user.id)) return prev;
					return [...prev, {
						...user,
						color: AVATAR_COLORS[user.id % AVATAR_COLORS.length]
					}];
				});
			});
			channel.leaving((user) => {
				setViewers((prev) => prev.filter((u) => u.id !== user.id));
			});
			return () => {
				echo.leave(`request.${requestId}`);
			};
		} catch {}
	}, [requestId]);
	if (viewers.length === 0) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: `flex items-center gap-2.5 ${className}`,
		title: "Active viewers on this request",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex -space-x-2 overflow-hidden items-center py-1",
			children: [viewers.slice(0, 4).map((viewer, index) => {
				const initials = viewer.name ? viewer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : viewer.username?.slice(0, 2).toUpperCase() || "U";
				const colorClass = viewer.color || AVATAR_COLORS[index % AVATAR_COLORS.length];
				return /* @__PURE__ */ jsxs("div", {
					className: "group relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr text-[10px] font-bold text-white shadow-md ring-2 ring-[#090a0f] hover:z-20 hover:scale-110 transition-all duration-150 select-none",
					style: { zIndex: 10 - index },
					children: [
						/* @__PURE__ */ jsx("div", {
							className: `h-full w-full rounded-full bg-gradient-to-tr ${colorClass} flex items-center justify-center`,
							children: /* @__PURE__ */ jsx("span", { children: initials })
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "absolute -bottom-0.5 -right-0.5 flex h-2 w-2",
							children: [/* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-[#090a0f]" })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute bottom-full mb-1.5 hidden flex-col items-center group-hover:flex z-30",
							children: /* @__PURE__ */ jsxs("span", {
								className: "whitespace-nowrap rounded-md border border-white/[0.1] bg-[#0c0d12] px-2 py-1 text-[10px] font-medium text-zinc-200 shadow-xl backdrop-blur-md",
								children: [viewer.name || viewer.username, authUser && viewer.id === authUser.id ? " (You)" : ""]
							})
						})
					]
				}, viewer.id);
			}), viewers.length > 4 && /* @__PURE__ */ jsxs("div", {
				className: "flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-zinc-850 text-[10px] font-medium text-zinc-300 ring-2 ring-[#090a0f]",
				children: ["+", viewers.length - 4]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-1.5 text-[11px] font-medium text-emerald-400",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "relative flex h-1.5 w-1.5",
				children: [/* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" })]
			}), /* @__PURE__ */ jsx("span", {
				className: "text-zinc-400",
				children: viewers.length === 1 ? "1 viewing now" : `${viewers.length} viewing now`
			})]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Requests/Show.tsx
function Show({ request: initialRequest, projects, users, statuses, priorities, canAssign, canEdit, canComment, canUpload, canDelete }) {
	const [request, setRequest] = useState(initialRequest);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(null);
	const [conflict, setConflict] = useState(null);
	const [lightboxSrc, setLightboxSrc] = useState(null);
	const update = async (changes) => {
		setSaving(true);
		setError(null);
		setConflict(null);
		try {
			const payload = {
				...changes,
				...request.lock_version !== void 0 ? { lock_version: request.lock_version } : {}
			};
			const { data } = await axios.patch(route("requests.update", request.id), payload);
			setRequest(data.request);
			if (changes.status === "done") triggerConfetti();
			toast.success("Request updated");
		} catch (err) {
			if (isAxiosError(err) && err.response?.status === 409) {
				const conflictMsg = err.response.data?.message || "This request has been updated by another teammate.";
				setConflict({ message: conflictMsg });
				toast.error(conflictMsg);
			} else {
				const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not save this change." : "Could not save this change.";
				setError(msg);
				toast.error(msg);
			}
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
	const handleReloadFresh = () => {
		setConflict(null);
		router.reload({ onSuccess: (page) => {
			const refreshed = page.props.request;
			if (refreshed) setRequest(refreshed);
		} });
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
			className: "flex flex-wrap items-center justify-between gap-3 text-xs w-full",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 min-w-0",
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
						className: "max-w-[240px] truncate font-medium text-zinc-300 sm:max-w-md",
						children: request.title
					})
				]
			}), /* @__PURE__ */ jsx(LivePresenceAvatars, { requestId: request.id })]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: `#${request.id} · ${request.title}` }),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-6xl space-y-6",
				children: [
					conflict && /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur-md animate-in fade-in duration-150",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 shrink-0 text-amber-400" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold text-white",
								children: conflict.message
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] font-normal text-amber-300/80",
								children: "Another team member made updates to this request while you were editing. Reload fresh state to merge."
							})] })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 shrink-0",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setConflict((prev) => prev ? {
									...prev,
									showDiff: !prev.showDiff
								} : null),
								className: "rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors",
								children: conflict.showDiff ? "Hide Notice" : "Review Changes"
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: handleReloadFresh,
								className: "flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition-colors shadow-sm",
								children: [/* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Reload Fresh State" })]
							})]
						})]
					}),
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
									lockVersion: request.lock_version,
									canEdit,
									onUpdate: update
								}),
								/* @__PURE__ */ jsx(RequestSubtasksSection, {
									request,
									canEdit,
									onSubtasksChange: (updated) => setRequest(updated)
								}),
								/* @__PURE__ */ jsx(RequestPullRequestsSection, { pullRequests: request.pull_requests || [] }),
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
