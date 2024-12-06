import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiUpload, FiBox, FiDollarSign, FiImage, FiX } from 'react-icons/fi'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import SellerLayout from '../../../../components/layouts/SellerLayout'
import ProtectedSellerRoute from '../../../../components/seller/ProtectedSellerRoute'
import { useSellerAuth } from '../../../../utils/sellerAuth'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    category: z.any(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    material: z.string().optional(),
    images: z.any(),
    glbModel: z.any()
})

type ProductFormData = z.infer<typeof productSchema>

type DraggableImageProps = {
    src: string
    index: number
    moveImage: (dragIndex: number, hoverIndex: number) => void
    onRemove: () => void
}

const DraggableImage = ({ src, index, moveImage, onRemove }: DraggableImageProps) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'IMAGE',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })

    const [, drop] = useDrop({
        accept: 'IMAGE',
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveImage(item.index, index)
                item.index = index
            }
        }
    })

    return (
        <div
            ref={(node) => drag(drop(node))}
            className={`relative group ${isDragging ? 'opacity-50' : ''}`}
        >
            <img
                src={src}
                alt={`Preview ${index + 1}`}
                className="h-24 w-24 object-cover rounded-lg cursor-move"
            />
            <button
                onClick={onRemove}
                className="absolute top-1 right-1 bg-red-500 rounded-full p-1 
                 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <FiX className="text-white w-4 h-4" />
            </button>
            {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                    Default
                </span>
            )}
        </div>
    )
}

export default function ProductUpload() {
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({
        current: 0,
        total: 0,
        fileName: ''
    })
    const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [glbFileName, setGlbFileName] = useState('')
    const router = useRouter()
    const { getSession } = useSellerAuth()

    const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema)
    })

    const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
        setImagesPreviews(prev => {
            const newPreviews = [...prev]
            const draggedItem = newPreviews[dragIndex]
            newPreviews.splice(dragIndex, 1)
            newPreviews.splice(hoverIndex, 0, draggedItem)
            return newPreviews
        })

        setImageFiles(prev => {
            const newFiles = [...prev]
            const draggedFile = newFiles[dragIndex]
            newFiles.splice(dragIndex, 1)
            newFiles.splice(hoverIndex, 0, draggedFile)
            return newFiles
        })
    }, [])

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const previews = files.map(file => URL.createObjectURL(file))
        setImagesPreviews(prev => [...prev, ...previews])
        setImageFiles(prev => [...prev, ...files])
    }

    const removeImage = (index: number) => {
        setImagesPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleGlbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.name.endsWith('.glb')) {
            setGlbFileName(file.name)
        } else {
            toast.error('Please upload a valid GLB file')
        }
    }

    const onSubmit = async (data: ProductFormData) => {
        setLoading(true)
        setUploadProgress({
            current: 0,
            total: 0,
            fileName: 'Initializing...'
        })

        const session = getSession()
        if (!session) {
            toast.error('Session expired')
            return
        }

        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'images' && key !== 'glbModel') {
                formData.append(key, value.toString())
            }
        })

        imageFiles.forEach((file, index) => {
            formData.append('images', file)
        })

        if (data.glbModel?.[0]) {
            formData.append('glbModel', data.glbModel[0])
        }

        let lastProgress = 0
        try {
            const response = await fetch('/api/seller/products/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                },
                body: formData
            })

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const { message, progress } = JSON.parse(line.slice(6))
                        if (progress >= lastProgress) {
                            lastProgress = progress
                            setUploadProgress({
                                current: progress,
                                total: progress,
                                fileName: message
                            })

                            if (progress === 100) {
                                await new Promise(resolve => setTimeout(resolve, 1000))
                                toast.success('Product uploaded successfully!')
                                await new Promise(resolve => setTimeout(resolve, 500))
                                router.push('/seller/dashboard/products')
                            }
                        }
                    }
                }
            }
        } catch (error) {
            toast.error('Upload failed')
            setLoading(false)
        }
    }








    return (
        <ProtectedSellerRoute>
            <SellerLayout>
                <DndProvider backend={HTML5Backend}>
                    <div className="max-w-4xl mx-auto py-6 px-4">
                        <h1 className="text-2xl font-bold text-white mb-8">Upload New Product</h1>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                                {/* Form fields  */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Product Name</label>
                                    <input
                                        {...register('name')}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Description</label>
                                    <textarea
                                        {...register('description')}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Price</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiDollarSign className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('price', { valueAsNumber: true })}
                                                type="number"
                                                step="0.01"
                                                className="block w-full pl-10 rounded-md bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Category</label>
                                        <select
                                            {...register('category')}
                                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                        >
                                            <option value="">Select category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home & Furniture">Home & Furniture</option>
                                            <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                                            <option value="Sports & Fitness">Sports & Fitness</option>
                                            <option value="Books & Stationery">Books & Stationery</option>
                                            <option value="Toys & Games">Toys & Games</option>
                                            <option value="Automotive">Automotive</option>
                                            <option value="Health & Wellness">Health & Wellness</option>
                                            <option value="Jewelry & Watches">Jewelry & Watches</option>
                                            <option value="Home Appliances">Home Appliances</option>
                                            <option value="Garden & Outdoor">Garden & Outdoor</option>
                                            <option value="Pet Supplies">Pet Supplies</option>
                                            <option value="Art & Crafts">Art & Crafts</option>
                                            <option value="Baby & Kids">Baby & Kids</option>
                                            <option value="Office Supplies">Office Supplies</option>
                                            <option value="Musical Instruments">Musical Instruments</option>
                                            <option value="Food & Beverages">Food & Beverages</option>
                                            <option value="Tools & Hardware">Tools & Hardware</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Dimensions</label>
                                        <input
                                            {...register('dimensions')}
                                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Weight</label>
                                        <input
                                            {...register('weight')}
                                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Material</label>
                                        <input
                                            {...register('material')}
                                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Product Images</h3>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-400">
                                            <label className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300">
                                                <span>Upload images</span>
                                                <input
                                                    {...register('images')}
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleImagesChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Drag and drop to reorder. First image will be the default display image.
                                        </p>
                                    </div>
                                </div>

                                {imagesPreviews.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {imagesPreviews.map((preview, index) => (
                                            <DraggableImage
                                                key={preview}
                                                src={preview}
                                                index={index}
                                                moveImage={moveImage}
                                                onRemove={() => removeImage(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* GLB Model Section */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-white">3D Model (GLB)</h3>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <FiBox className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-400">
                                            <label className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300">
                                                <span>Upload GLB file</span>
                                                <input
                                                    {...register('glbModel')}
                                                    type="file"
                                                    accept=".glb"
                                                    className="sr-only"
                                                    onChange={handleGlbChange}
                                                />
                                            </label>
                                        </div>
                                        {glbFileName && <p className="text-sm text-gray-400">{glbFileName}</p>}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md
                         shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                         disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Product'}
                            </button>
                        </form>
                    </div>

                    {loading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-6 rounded-lg w-96">
                                <div className="mb-4">
                                    <div className="text-white text-center mb-2">
                                        {uploadProgress.fileName}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div
                                            className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress.current}%` }}
                                        />
                                    </div>
                                    <div className="text-white text-center mt-2">
                                        Total Progress: {uploadProgress.total}%
                                    </div>
                                </div>
                                <div className="text-gray-400 text-sm text-center">
                                    Please don't close this window while uploading
                                </div>
                            </div>
                        </div>
                    )}
                </DndProvider>
            </SellerLayout>
        </ProtectedSellerRoute>
    )
}
