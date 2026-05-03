"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, Sparkles, Clock, TrendingUp, Cpu, Zap, Database, Plus, Edit, Trash2, Save } from 'lucide-react'
import { fetchModels, createModel, updateModel, deleteModel } from '@/lib/services/api'
import { Model } from '@/lib/types/model'

interface ModelsOverlayProps {
    isOpen: boolean
    onClose: () => void
}

export function ModelsOverlay({ isOpen, onClose }: ModelsOverlayProps) {
    const [models, setModels] = useState<Model[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedModel, setSelectedModel] = useState<Model | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingModel, setEditingModel] = useState<Model | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Model>>({
        name: '',
        version: '',
        type: 'chat',
        description: '',
        status: 'active',
    })

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showForm) {
                    setShowForm(false)
                    setEditingModel(null)
                } else if (selectedModel) {
                    setSelectedModel(null)
                } else if (deletingId) {
                    setDeletingId(null)
                } else {
                    onClose()
                }
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isOpen, onClose, selectedModel, showForm, deletingId])

    const loadModels = async () => {
        try {
            setLoading(true)
            const response = await fetchModels(20, 1)
            setModels(response.data || [])
            setError(null)
        } catch (err) {
            setError('Failed to load models')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadModels()
        }
    }, [isOpen])

    const handleCreate = async () => {
        try {
            await createModel(formData)
            setShowForm(false)
            setFormData({ name: '', version: '', type: 'chat', description: '', status: 'active' })
            loadModels()
        } catch (err: any) {
            alert(err.message || 'Failed to create model')
        }
    }

    const handleUpdate = async () => {
        if (!editingModel) return
        try {
            await updateModel(editingModel.id, formData)
            setShowForm(false)
            setEditingModel(null)
            setFormData({ name: '', version: '', type: 'chat', description: '', status: 'active' })
            loadModels()
        } catch (err: any) {
            alert(err.message || 'Failed to update model')
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteModel(id)
            setDeletingId(null)
            loadModels()
        } catch (err: any) {
            alert(err.message || 'Failed to delete model')
        }
    }

    const openEditForm = (model: Model) => {
        setEditingModel(model)
        setFormData({
            name: model.name,
            version: model.version,
            type: model.type,
            description: model.description,
            status: model.status,
            owner: model.owner,
            endpoint_url: model.endpoint_url,
        })
        setShowForm(true)
        setSelectedModel(null)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="fixed inset-0 z-[300] w-full h-full bg-black"
                >
                    {/* Background gradient effects */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all backdrop-blur-sm"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>

                    {/* Content */}
                    <div className="relative z-10 w-full h-full overflow-auto p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="flex items-center justify-between mb-12"
                            >
                                <div className="text-center flex-1">
                                    <div className="inline-flex items-center gap-3 mb-4">
                                        <Cpu className="w-8 h-8 text-violet-400" />
                                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40">
                                            AI Models
                                        </h1>
                                    </div>
                                    <p className="text-white/40 text-sm">
                                        Explore our collection of AI models
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowForm(true)
                                        setEditingModel(null)
                                        setFormData({ name: '', version: '', type: 'chat', description: '', status: 'active' })
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white text-sm font-medium transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Model
                                </button>
                            </motion.div>

                            {/* Error State */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Loading State */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <motion.div
                                            key={`skeleton-${i}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl animate-pulse"
                                        >
                                            <div className="h-6 bg-white/10 rounded mb-4" />
                                            <div className="h-4 bg-white/5 rounded mb-2" />
                                            <div className="h-4 bg-white/5 rounded w-2/3" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                /* Models Grid */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {models.map((model, index) => (
                                        <motion.div
                                            key={model.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl transition-all hover:bg-white/[0.05] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0" />
                                                    <h3 className="font-semibold text-white text-lg truncate">
                                                        {model.name}
                                                    </h3>
                                                </div>
                                                <span className={`
                          px-2 py-1 rounded-md text-xs font-medium uppercase flex-shrink-0 ml-2
                          ${model.status === 'active'
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'}
                        `}>
                                                    {model.status}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-white/50 text-sm mb-4 line-clamp-2">
                                                {model.description || 'No description available'}
                                            </p>

                                            {/* Metadata */}
                                            <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{model.version}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Database className="w-3.5 h-3.5" />
                                                    <span>{model.type}</span>
                                                </div>
                                                {model.metrics?.accuracy && (
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        <span>{(model.metrics.accuracy * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tags */}
                                            {model.tags && model.tags.length > 0 && (
                                                <div className="flex gap-2 flex-wrap mb-4">
                                                    {model.tags.slice(0, 3).map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded-md text-xs text-violet-300"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => setSelectedModel(model)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white text-xs transition-all"
                                                >
                                                    <Zap className="w-3.5 h-3.5" />
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => openEditForm(model)}
                                                    className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition-all"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(model.id)}
                                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && models.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <Cpu className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/40 mb-4">No models available</p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white text-sm font-medium transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Your First Model
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Model Detail Modal */}
                    <AnimatePresence>
                        {selectedModel && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[350] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                                onClick={() => setSelectedModel(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    className="max-w-2xl w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-h-[80vh] overflow-auto"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-6 h-6 text-violet-400" />
                                            <h2 className="text-2xl font-bold text-white">{selectedModel.name}</h2>
                                        </div>
                                        <button
                                            onClick={() => setSelectedModel(null)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4 text-white/70 text-sm">
                                        <div>
                                            <span className="text-white/40">Status: </span>
                                            <span className={selectedModel.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                                                {selectedModel.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Version: </span>
                                            <span>{selectedModel.version}</span>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Type: </span>
                                            <span>{selectedModel.type}</span>
                                        </div>
                                        {selectedModel.description && (
                                            <div>
                                                <span className="text-white/40">Description: </span>
                                                <p className="mt-1">{selectedModel.description}</p>
                                            </div>
                                        )}
                                        {selectedModel.owner && (
                                            <div>
                                                <span className="text-white/40">Owner: </span>
                                                <span>{selectedModel.owner}</span>
                                            </div>
                                        )}
                                        {selectedModel.endpoint_url && (
                                            <div>
                                                <span className="text-white/40">Endpoint: </span>
                                                <span className="text-violet-400">{selectedModel.endpoint_url}</span>
                                            </div>
                                        )}
                                        {selectedModel.metrics && (
                                            <div>
                                                <span className="text-white/40 block mb-2">Metrics:</span>
                                                <pre className="bg-white/5 p-3 rounded-lg text-xs overflow-auto">
                                                    {JSON.stringify(selectedModel.metrics, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {selectedModel.config && (
                                            <div>
                                                <span className="text-white/40 block mb-2">Configuration:</span>
                                                <pre className="bg-white/5 p-3 rounded-lg text-xs overflow-auto">
                                                    {JSON.stringify(selectedModel.config, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Create/Edit Form Modal */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[350] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingModel(null)
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    className="max-w-2xl w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-h-[80vh] overflow-auto"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">
                                            {editingModel ? 'Edit Model' : 'Create New Model'}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowForm(false)
                                                setEditingModel(null)
                                            }}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-white/70 text-sm mb-2">Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
                                                placeholder="e.g., GPT X LUMINA"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-white/70 text-sm mb-2">Version *</label>
                                                <input
                                                    type="text"
                                                    value={formData.version || ''}
                                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
                                                    placeholder="e.g., 1.0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-white/70 text-sm mb-2">Type *</label>
                                                <select
                                                    value={formData.type || 'chat'}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
                                                >
                                                    <option value="chat">Chat</option>
                                                    <option value="completion">Completion</option>
                                                    <option value="embedding">Embedding</option>
                                                    <option value="image">Image</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-white/70 text-sm mb-2">Description</label>
                                            <textarea
                                                value={formData.description || ''}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50 min-h-[100px]"
                                                placeholder="Describe your model..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white/70 text-sm mb-2">Endpoint URL</label>
                                            <input
                                                type="url"
                                                value={formData.endpoint_url || ''}
                                                onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
                                                placeholder="https://api.example.com/v1/models"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white/70 text-sm mb-2">Owner</label>
                                            <input
                                                type="text"
                                                value={formData.owner || ''}
                                                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
                                                placeholder="e.g., team-ml"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white/70 text-sm mb-2">Status *</label>
                                            <select
                                                value={formData.status || 'active'}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'deprecated' | 'inactive' })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
                                            >
                                                <option value="active">Active</option>
                                                <option value="deprecated">Deprecated</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={editingModel ? handleUpdate : handleCreate}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-all"
                                            >
                                                <Save className="w-4 h-4" />
                                                {editingModel ? 'Update Model' : 'Create Model'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowForm(false)
                                                    setEditingModel(null)
                                                }}
                                                className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Delete Confirmation Modal */}
                    <AnimatePresence>
                        {deletingId && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[360] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                                onClick={() => setDeletingId(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    className="max-w-md w-full bg-black/90 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8"
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Trash2 className="w-8 h-8 text-red-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Delete Model?</h2>
                                        <p className="text-white/60">This action cannot be undone.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleDelete(deletingId)}
                                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
