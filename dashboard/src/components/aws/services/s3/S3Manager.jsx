// Componente principal para gestionar buckets y objetos de Amazon S3
// Este componente se muestra como un panel modal en la aplicación

import React, { useState, useEffect } from 'react';
import { 
  FaAws, FaFolder, FaFile, FaUpload, FaDownload, 
  FaTrash, FaSearch, FaEye, FaCopy, FaLock, 
  FaHistory, FaFolderPlus, FaPlus, FaTimes, FaLink, FaTags, FaImage, FaFilePdf, FaFileWord, FaVideo, FaMusic, FaCode, FaFileArchive, FaEllipsisH, FaBars, FaCog
} from 'react-icons/fa';
import { 
  listBuckets, 
  createBucket, 
  deleteBucket, 
  listObjects,
  uploadFile,
  downloadObject,
  deleteObject,
  getBucketPolicy,
  updateBucketPolicy,
  listObjectVersions,
  getPresignedUrl,
  getObjectMetadata,
  getObjectTags,
  addObjectTag,
  setObjectEncryption,
  formatBytes,
  getObjectPreview,
  removeObjectTag,
  configureBucketCors,
  getBucketEncryption,
  getObjectEncryption
} from '../../../../services/s3Service';
import { listKMSKeys } from '../../../../services/kmsService';
import './S3Manager.css';
import PropTypes from 'prop-types';

// Función para determinar el tipo de icono
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  // Mapeo de extensiones a iconos y clases
  const iconMap = {
    // Imágenes
    jpg: { icon: FaImage, className: 'icon-image' },
    jpeg: { icon: FaImage, className: 'icon-image' },
    png: { icon: FaImage, className: 'icon-image' },
    gif: { icon: FaImage, className: 'icon-image' },
    
    // Documentos
    pdf: { icon: FaFilePdf, className: 'icon-document' },
    doc: { icon: FaFileWord, className: 'icon-document' },
    docx: { icon: FaFileWord, className: 'icon-document' },
    
    // Videos
    mp4: { icon: FaVideo, className: 'icon-video' },
    mov: { icon: FaVideo, className: 'icon-video' },
    
    // Audio
    mp3: { icon: FaMusic, className: 'icon-audio' },
    wav: { icon: FaMusic, className: 'icon-audio' },
    
    // Código
    js: { icon: FaCode, className: 'icon-code' },
    html: { icon: FaCode, className: 'icon-code' },
    css: { icon: FaCode, className: 'icon-code' },
    
    // Archivos comprimidos
    zip: { icon: FaFileArchive, className: 'icon-archive' },
    rar: { icon: FaFileArchive, className: 'icon-archive' }
  };

  return iconMap[extension] || { icon: FaFile, className: 'icon-default' };
};

// Componente ObjectItem separado
const ObjectItem = ({ 
  object, 
  selectedBucket, 
  handlePreview, 
  handleDownloadObject, 
  generatePresignedUrl, 
  handleShowTags, 
  handleEncryption, 
  handleDeleteObject,
  openActionMenu,
  setOpenActionMenu 
}) => {
  const [objectTags, setObjectTags] = useState([]);
  const [encryptionInfo, setEncryptionInfo] = useState(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getObjectTags(selectedBucket, object.Key);
        setObjectTags(tags);
      } catch (error) {
        console.error('Error al cargar etiquetas:', error);
        setObjectTags([]);
      }
    };
    
    const loadEncryption = async () => {
      try {
        const encryption = await getObjectEncryption(selectedBucket, object.Key);
        setEncryptionInfo(encryption);
      } catch (error) {
        console.error('Error al cargar información de cifrado:', error);
        setEncryptionInfo(null);
      }
    };

    loadTags();
    loadEncryption();
  }, [selectedBucket, object.Key]);

  const { icon: Icon, className } = getFileIcon(object.Key);

  return (
    <div className="object-item">
      <div className="object-info">
        <div className="object-name-container">
          <Icon className={`object-icon ${getFileIcon(object.Key).className}`} />
          <div>
            <div className="object-name">{object.Key.split('/').pop()}</div>
            <div className="object-details">
              {formatBytes(object.Size)} • {new Date(object.LastModified).toLocaleDateString()}
              {encryptionInfo && (
                <span className="encryption-badge" title={encryptionInfo.kmsKeyId || 'Cifrado con AES-256'}>
                  <FaLock /> {encryptionInfo.algorithm === 'aws:kms' ? 'KMS' : 'AES-256'}
                </span>
              )}
            </div>
          </div>
        </div>
        {objectTags && objectTags.length > 0 && (
          <div className="object-tags">
            {objectTags.map(tag => (
              <span key={tag.Key} className="tag-badge">
                {tag.Key}: {tag.Value}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="object-actions">
        <button 
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenActionMenu(openActionMenu === object.Key ? null : object.Key);
          }}
          title="Más acciones"
        >
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        <div className={`actions-menu ${openActionMenu === object.Key ? 'open' : ''}`}>
          <div className="action-item" onClick={() => handlePreview(object.Key)}>
            <FaEye /> Previsualizar
          </div>
          <div className="action-item" onClick={() => handleDownloadObject(object.Key)}>
            <FaDownload /> Descargar
          </div>
          <div className="action-item" onClick={() => generatePresignedUrl(object.Key)}>
            <FaLink /> Copiar enlace
          </div>
          <div className="action-item" onClick={() => handleShowTags(object.Key)}>
            <FaTags /> Etiquetas
          </div>
          <div className="action-item" onClick={() => handleEncryption(object.Key)}>
            <FaLock /> Cifrar
          </div>
          <div className="action-item delete" onClick={() => handleDeleteObject(object.Key)}>
            <FaTrash /> Eliminar
          </div>
        </div>
      </div>
    </div>
  );
};

// Props:
// - onClose: función para cerrar el panel
// - isOpen: boolean para indicar si el panel está abierto
const S3Manager = ({ onClose, isOpen }) => {
  // Estados
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [objects, setObjects] = useState({ folders: [], files: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [showVersions, setShowVersions] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [bucketPolicy, setBucketPolicy] = useState(null);
  const [objectVersions, setObjectVersions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showMetadata, setShowMetadata] = useState(false);
  const [objectMetadata, setObjectMetadata] = useState(null);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedObjectTags, setSelectedObjectTags] = useState([]);
  const [newTag, setNewTag] = useState({ key: '', value: '' });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    extension: '',
    size: { min: '', max: '' },
    date: { from: '', to: '' },
    tags: []
  });
  const [encryptionSettings, setEncryptionSettings] = useState({
    type: 'none',
    kmsKeyId: ''
  });
  const [transfers, setTransfers] = useState([]);
  const [showTransfers, setShowTransfers] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [actionMenuRef, setActionMenuRef] = useState(null);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [selectedObjectForEncryption, setSelectedObjectForEncryption] = useState(null);
  const [bucketsEncryption, setBucketsEncryption] = useState({});
  const [kmsKeys, setKmsKeys] = useState([]);
  const [loadingKmsKeys, setLoadingKmsKeys] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedBucketForSettings, setSelectedBucketForSettings] = useState(null);
  const [menuPosition, setMenuPosition] = useState('down');
  const [openMenuKey, setOpenMenuKey] = useState(null);

  // Cargar buckets al inicio
  useEffect(() => {
    const awsCredentials = localStorage.getItem('awsCredentials');
    if (awsCredentials) {
      loadBuckets();
    }
  }, []);

  // Cargar objetos cuando se selecciona un bucket
  useEffect(() => {
    if (selectedBucket) {
      loadObjects(selectedBucket);
    }
  }, [selectedBucket]);

  // Cargar claves KMS cuando se abre el modal de crear bucket
  useEffect(() => {
    if (showCreateModal) {
      loadKMSKeys();
    }
  }, [showCreateModal]);

  // Funciones principales
  const handleOperation = async (operation, errorMessage) => {
    setLoading(true);
    setError(null);
    try {
      await operation();
    } catch (err) {
      setError(errorMessage || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar la información de cifrado de un bucket
  const loadBucketEncryption = async (bucketName) => {
    try {
      const encryption = await getBucketEncryption(bucketName);
      setBucketsEncryption(prev => ({
        ...prev,
        [bucketName]: encryption
      }));
    } catch (error) {
      console.error('Error al cargar cifrado del bucket:', error);
    }
  };

  // Modificar loadBuckets para cargar el cifrado
  const loadBuckets = async () => {
    try {
      setLoading(true);
      const buckets = await listBuckets();
      setBuckets(buckets);
      // Cargar cifrado para cada bucket
      buckets.forEach(bucket => loadBucketEncryption(bucket.Name));
    } catch (error) {
      console.error('Error al cargar buckets:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadObjects = (bucketName, prefix = '') => handleOperation(async () => {
    const list = await listObjects(bucketName, prefix);
    
    // Procesar objetos para mostrar carpetas y archivos
    const processedObjects = {
      folders: [],
      files: []
    };

    // Si list es un array, procesarlo
    if (Array.isArray(list)) {
      list.forEach(obj => {
        const key = obj.Key;
        if (key.endsWith('/')) {
          processedObjects.folders.push({
            name: key.split('/').slice(-2)[0],
            path: key
          });
        } else {
          processedObjects.files.push(obj);
        }
      });
    }

    setObjects(processedObjects);
  }, 'Error al cargar los objetos');

  const handleCreateBucket = async () => {
    try {
      setLoading(true);
      await createBucket(newBucketName, encryptionSettings);
      console.log('Bucket creado:', newBucketName);
      await loadBuckets();
      setNewBucketName('');
      setShowCreateModal(false);
      setEncryptionSettings({ type: 'none', kmsKeyId: '' });
    } catch (error) {
      console.error('Error al crear bucket:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBucket = (bucketName) => {
    if (window.confirm(`¿Estás seguro de eliminar el bucket ${bucketName}?`)) {
      handleOperation(async () => {
        await deleteBucket(bucketName);
        await loadBuckets();
        if (selectedBucket === bucketName) {
          setSelectedBucket(null);
          setObjects({ folders: [], files: [] });
        }
      }, 'Error al eliminar el bucket');
    }
  };

  // Función para actualizar transferencias de manera segura
  const updateTransfers = (newTransfer) => {
    setTransfers(prev => {
      const currentTransfers = Array.isArray(prev) ? prev : [];
      return [...currentTransfers, newTransfer];
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedBucket) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Iniciando subida de archivo:', file.name);
      const key = currentPath 
        ? `${currentPath}${file.name}`
        : file.name;

      // Crear nueva transferencia
      const newTransfer = {
        name: file.name,
        progress: 0,
        status: 'uploading'
      };
      updateTransfers(newTransfer);
      setShowTransfers(true);

      // Obtener credenciales del localStorage
      const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
      if (!credentials) {
        throw new Error('No se encontraron credenciales AWS');
      }

      console.log('Subiendo archivo a S3...');
      const uploadResponse = await uploadFile(selectedBucket, file, key, credentials);
      console.log('Respuesta de subida:', uploadResponse);

      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Actualizando lista de objetos...');
      await loadObjects(selectedBucket, currentPath);

      // Actualizar el estado de la transferencia con verificación de nulidad
      setTransfers(prev => {
        if (!prev) return [];
        const newTransfers = prev.map(t => 
          t.name === file.name 
            ? { ...t, progress: 100, status: 'completed' }
            : t
        );
        
        const allCompleted = newTransfers.every(t => t.status === 'completed');
        if (allCompleted) {
          setTimeout(() => {
            setShowTransfers(false);
            setTransfers(prev => (prev || []).filter(t => t.status === 'uploading'));
          }, 2000);
        }
        
        return newTransfers;
      });

      event.target.value = '';
      setError(null);
      console.log('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error detallado al subir el archivo:', error);
      setError('Error al subir el archivo: ' + (error.message || 'Error desconocido'));
      
      setTransfers(prev => {
        const currentTransfers = Array.isArray(prev) ? prev : [];
        return currentTransfers.map(t => 
          t.name === file.name 
            ? { ...t, status: 'error', error: error.message }
            : t
        );
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadObject = async (key) => {
    handleOperation(async () => {
      const data = await downloadObject(selectedBucket, key);
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 'Error al descargar el archivo');
  };

  const handleDeleteObject = (key) => {
    if (window.confirm(`¿Estás seguro de eliminar el objeto ${key}?`)) {
      handleOperation(async () => {
        await deleteObject(selectedBucket, key);
        await loadObjects(selectedBucket);
      }, 'Error al eliminar el objeto');
    }
  };

  // Filtrado de objetos con verificación de nulidad
  const filteredObjects = objects?.files?.filter(obj => 
    obj.Key.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Verificación de objetos en el renderizado con operador opcional
  const hasNoFolders = !objects?.folders?.length;
  const hasNoFilteredObjects = !filteredObjects?.length;

  const handleClose = () => {
    console.log('S3Manager: Intentando cerrar');
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Agregar efecto de limpieza
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Función para crear carpeta
  const handleCreateFolder = async () => {
    if (!selectedBucket || !newFolderName) return;
    
    try {
      const folderKey = currentPath 
        ? `${currentPath}/${newFolderName}/` 
        : `${newFolderName}/`;

      await uploadFile(selectedBucket, new Blob(['']), folderKey);
      await loadObjects(selectedBucket);
      setShowNewFolderModal(false);
      setNewFolderName('');
    } catch (error) {
      setError('Error al crear la carpeta');
      console.error(error);
    }
  };

  // Función para navegar entre carpetas
  const handleNavigate = (path) => {
    setCurrentPath(path);
    loadObjects(selectedBucket, path);
  };

  // Función para previsualizar archivo
  const handlePreview = async (key) => {
    try {
      setLoading(true);
      setError(null);
      const preview = await getObjectPreview(selectedBucket, key);
      setPreviewFile(preview);
      setOpenActionMenu(null);
    } catch (error) {
      console.error('Error al previsualizar:', error);
      setError('Error al previsualizar el archivo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener y mostrar permisos
  const handleShowPermissions = async (bucketName) => {
    try {
      const policy = await getBucketPolicy(bucketName);
      setBucketPolicy(policy);
      setShowPermissions(true);
    } catch (error) {
      setError('Error al obtener los permisos del bucket');
    }
  };

  // Función para actualizar la política del bucket
  const handleUpdatePolicy = async () => {
    try {
      await updateBucketPolicy(selectedBucket, JSON.stringify(bucketPolicy, null, 2));
      await loadBuckets();
      setShowPermissions(false);
    } catch (error) {
      setError('Error al actualizar la política del bucket');
    }
  };

  // Función para obtener versiones
  const loadVersions = async (key) => {
    try {
      const objectVersions = await listObjectVersions(selectedBucket, key);
      setVersions(objectVersions);
      setSelectedObject(key);
      setShowVersions(true);
    } catch (error) {
      setError('Error al cargar versiones');
    }
  };

  // Función para manejar drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Subir múltiples archivos
    try {
      setLoading(true);
      for (const file of files) {
        const key = `${currentPath}${file.name}`;
        await uploadFile(selectedBucket, file, key);
      }
      await loadObjects(selectedBucket, currentPath);
    } catch (error) {
      setError('Error al subir archivos');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar URL presignada
  const generatePresignedUrl = async (key) => {
    try {
      setLoading(true);
      const url = await getPresignedUrl(selectedBucket, key);
      await navigator.clipboard.writeText(url);
      setOpenActionMenu(null);
      
      // Mostrar mensaje de éxito
      alert('URL copiada al portapapeles. La URL expirará en 1 hora.');
    } catch (error) {
      console.error('Error al generar URL:', error);
      setError('Error al generar la URL: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar metadatos
  const loadMetadata = async (key) => {
    try {
      const metadata = await getObjectMetadata(selectedBucket, key);
      setObjectMetadata(metadata);
      setShowMetadata(true);
    } catch (error) {
      setError('Error al cargar metadatos');
    }
  };

  // Función para mostrar tags
  const handleShowTags = async (key) => {
    try {
      setSelectedObject(key);
      const tags = await getObjectTags(selectedBucket, key);
      setSelectedObjectTags(Array.isArray(tags) ? tags : []);
      setShowTagsModal(true);
    } catch (error) {
      console.error('Error al obtener tags:', error);
      setError('Error al obtener las etiquetas del objeto');
      setSelectedObjectTags([]);
    }
  };

  const handleAddTag = async () => {
    if (!selectedObject || !newTag.key || !newTag.value) return;
    
    try {
      await addObjectTag(selectedBucket, selectedObject, newTag);
      // Actualizar la lista de tags
      const updatedTags = await getObjectTags(selectedBucket, selectedObject);
      setSelectedObjectTags(updatedTags);
      // Limpiar el formulario
      setNewTag({ key: '', value: '' });
    } catch (error) {
      console.error('Error al añadir etiqueta:', error);
      setError('Error al añadir la etiqueta');
    }
  };

  const handleRemoveTag = async (tagKey) => {
    if (!selectedObject) return;
    
    try {
      await removeObjectTag(selectedBucket, selectedObject, tagKey);
      // Actualizar la lista de tags
      const updatedTags = await getObjectTags(selectedBucket, selectedObject);
      setSelectedObjectTags(updatedTags);
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      setError('Error al eliminar la etiqueta');
    }
  };

  // Función de búsqueda avanzada
  const filterObjects = (objects) => {
    return objects.filter(obj => {
      const fileName = obj.Key.toLowerCase();
      const searchTermMatch = fileName.includes(searchTerm.toLowerCase());
      
      if (!searchTermMatch) return false;
      
      // Filtrar por extensión
      if (searchFilters.extension && 
          !fileName.endsWith(searchFilters.extension.toLowerCase())) {
        return false;
      }
      
      // Filtrar por tamaño
      if (searchFilters.size.min && obj.Size < parseInt(searchFilters.size.min)) {
        return false;
      }
      if (searchFilters.size.max && obj.Size > parseInt(searchFilters.size.max)) {
        return false;
      }
      
      // Filtrar por fecha
      const objDate = new Date(obj.LastModified);
      if (searchFilters.date.from && objDate < new Date(searchFilters.date.from)) {
        return false;
      }
      if (searchFilters.date.to && objDate > new Date(searchFilters.date.to)) {
        return false;
      }
      
      return true;
    });
  };

  // Componente de búsqueda avanzada
  const AdvancedSearch = () => (
    <div className="advanced-search">
      <div className="search-group">
        <label>Extensión</label>
        <input
          type="text"
          placeholder=".pdf, .jpg, etc."
          value={searchFilters.extension}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            extension: e.target.value
          })}
        />
      </div>
      
      <div className="search-group">
        <label>Tamaño (bytes)</label>
        <div className="size-inputs">
          <input
            type="number"
            placeholder="Min"
            value={searchFilters.size.min}
            onChange={(e) => setSearchFilters({
              ...searchFilters,
              size: { ...searchFilters.size, min: e.target.value }
            })}
          />
          <input
            type="number"
            placeholder="Max"
            value={searchFilters.size.max}
            onChange={(e) => setSearchFilters({
              ...searchFilters,
              size: { ...searchFilters.size, max: e.target.value }
            })}
          />
        </div>
      </div>
      
      <div className="search-group">
        <label>Fecha de modificación</label>
        <div className="date-inputs">
          <input
            type="date"
            value={searchFilters.date.from}
            onChange={(e) => setSearchFilters({
              ...searchFilters,
              date: { ...searchFilters.date, from: e.target.value }
            })}
          />
          <input
            type="date"
            value={searchFilters.date.to}
            onChange={(e) => setSearchFilters({
              ...searchFilters,
              date: { ...searchFilters.date, to: e.target.value }
            })}
          />
        </div>
      </div>
    </div>
  );

  // Función para cifrar objeto
  const handleEncryption = async (key) => {
    setSelectedObjectForEncryption(key);
    setShowEncryptionModal(true);
  };

  // Función para aplicar el cifrado
  const applyEncryption = async () => {
    try {
      setLoading(true);
      await setObjectEncryption(selectedBucket, selectedObjectForEncryption, encryptionSettings);
      setShowEncryptionModal(false);
      setSelectedObjectForEncryption(null);
      alert('Cifrado aplicado correctamente');
    } catch (error) {
      console.error('Error al cifrar:', error);
      setError('Error al aplicar el cifrado al objeto');
    } finally {
      setLoading(false);
    }
  };

  // Componente de progreso
  const TransferProgress = ({ transfer }) => (
    <div className="transfer-item">
      <div className="transfer-info">
        <span>{transfer.name}</span>
        <span>{transfer.status === 'completed' ? 'Completado' : 'En progreso'}</span>
        <span>{transfer.progress}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${transfer.progress}%` }}
        />
      </div>
    </div>
  );

  // En el componente S3Manager, actualizar el useEffect para el clic fuera:
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.object-actions')) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

  // Añadir función para configurar CORS en un bucket existente
  const handleConfigureCors = async (bucketName) => {
    try {
      setLoading(true);
      await configureBucketCors(bucketName);
      console.log('CORS configurado para el bucket:', bucketName);
    } catch (error) {
      console.error('Error al configurar CORS:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el modal de ajustes
  const renderSettingsModal = () => {
    if (!selectedBucketForSettings) return null;

    const bucket = buckets.find(b => b.Name === selectedBucketForSettings);
    if (!bucket) return null;

    const encryption = bucketsEncryption[bucket.Name];
    const encryptionType = encryption?.Rules?.[0]?.ApplyServerSideEncryptionByDefault?.SSEAlgorithm;
    const kmsKeyId = encryption?.Rules?.[0]?.ApplyServerSideEncryptionByDefault?.KMSMasterKeyID;

    return (
      <div className="s3-modal">
        <div className="s3-modal-content">
          <div className="modal-header">
            <h2>Información del Bucket</h2>
            <button 
              className="close-button"
              onClick={() => {
                setShowSettingsModal(false);
                setSelectedBucketForSettings(null);
              }}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="bucket-info-content">
            <div className="info-group">
              <strong>Nombre del Bucket:</strong>
              <span>{bucket.Name}</span>
            </div>
            
            <div className="info-group">
              <strong>Región:</strong>
              <span>{JSON.parse(localStorage.getItem('awsCredentials'))?.region || 'No especificada'}</span>
            </div>

            <div className="info-group">
              <strong>ARN del Bucket:</strong>
              <span className="monospace">arn:aws:s3:::{bucket.Name}</span>
            </div>
            
            <div className="info-group">
              <strong>Fecha de creación:</strong>
              <span>{new Date(bucket.CreationDate).toLocaleString()}</span>
            </div>

            <div className="info-group">
              <strong>Estado del cifrado:</strong>
              {encryption ? (
                <div className="encryption-details">
                  <span className="encryption-status enabled">
                    <FaLock /> Cifrado habilitado
                  </span>
                  <span>Algoritmo: {encryptionType === 'AES256' ? 'AES-256' : encryptionType}</span>
                  {kmsKeyId && (
                    <span className="kms-key">KMS Key ID: {kmsKeyId}</span>
                  )}
                </div>
              ) : (
                <span className="encryption-status disabled">
                  <FaLock /> Cifrado no configurado
                </span>
              )}
            </div>

            <div className="info-group">
              <strong>Versionado:</strong>
              <span>No configurado (próximamente)</span>
            </div>

            <div className="info-group">
              <strong>Acceso público:</strong>
              <span>Bloqueado (próximamente)</span>
            </div>

            <div className="info-group">
              <strong>Política de ciclo de vida:</strong>
              <span>No configurada (próximamente)</span>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="s3-btn"
              onClick={() => handleConfigureCors(bucket.Name)}
            >
              Configurar CORS
            </button>
            <button 
              className="s3-btn primary"
              onClick={() => {
                setShowSettingsModal(false);
                setSelectedBucketForSettings(null);
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Función para cargar las claves KMS
  const loadKMSKeys = async () => {
    try {
      setLoadingKmsKeys(true);
      const keys = await listKMSKeys();
      setKmsKeys(keys);
    } catch (error) {
      console.error('Error al cargar claves KMS:', error);
      setError('Error al cargar las claves KMS');
    } finally {
      setLoadingKmsKeys(false);
    }
  };

  const toggleMenu = (event, objectKey) => {
    event.stopPropagation();
    
    // Si ya está abierto el menú para este objeto, lo cerramos
    if (openMenuKey === objectKey) {
      setOpenMenuKey(null);
      return;
    }

    // Obtenemos la posición del botón que activó el menú
    const buttonRect = event.currentTarget.getBoundingClientRect();
    // Obtenemos la altura de la ventana
    const windowHeight = window.innerHeight;
    // Calculamos el espacio disponible abajo del botón
    const spaceBelow = windowHeight - buttonRect.bottom;
    // Altura estimada del menú (número de items * altura por item + padding)
    const menuHeight = 4 * 48 + 16; // 4 items de 48px + 16px de padding

    // Si no hay suficiente espacio abajo, añadimos la clase menu-up
    const shouldShowUp = spaceBelow < menuHeight;
    
    // Guardamos la posición preferida en el estado
    setMenuPosition(shouldShowUp ? 'up' : 'down');
    // Abrimos el menú para este objeto
    setOpenMenuKey(objectKey);
  };

  return (
    <div className="s3-overlay">
      <div className="s3-container">
        <button className="s3-close" onClick={handleClose} aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="s3-header">
          <h1 className="s3-title">S3 Manager</h1>
          <div className="s3-actions">
            <button 
              className="new-bucket-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Nuevo Bucket
            </button>
          </div>
        </div>

        {/* Breadcrumb - Solo mostrar el path actual si existe */}
        {selectedBucket && currentPath && (
          <div className="s3-breadcrumb">
            {currentPath.split('/').map((part, index) => (
              <span key={index} className="path-part">{part}</span>
            ))}
          </div>
        )}

        {/* Main content con tabs */}
        <div className="s3-content">
          {/* Panel izquierdo */}
          <div className="s3-sidebar">
            <div className="s3-section-header">
              <h2>Mis Buckets</h2>
              {loading && <div className="s3-spinner" />}
            </div>
            <div className="buckets-container">
              {buckets.map(bucket => (
                <div
                  key={bucket.Name}
                  className={`bucket ${selectedBucket === bucket.Name ? 'selected' : ''}`}
                >
                  <div className="bucket-info">
                    <span onClick={() => setSelectedBucket(bucket.Name)}>
                      {bucket.Name}
                    </span>
                    {bucketsEncryption[bucket.Name] && (
                      <span className="encryption-badge" title="Este bucket tiene cifrado por defecto">
                        <FaLock />
                        {bucketsEncryption[bucket.Name]?.Rules?.[0]?.ApplyServerSideEncryptionByDefault?.SSEAlgorithm === 'aws:kms' 
                          ? 'KMS' 
                          : 'AES-256'}
                      </span>
                    )}
                  </div>
                  <div className="bucket-actions">
                    <button 
                      className="s3-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(e, bucket.Name);
                      }}
                    >
                      <FaBars />
                    </button>
                    <button 
                      className="s3-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBucketForSettings(bucket.Name);
                        setShowSettingsModal(true);
                      }}
                    >
                      <FaCog />
                    </button>
                    <button 
                      className="s3-icon-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBucket(bucket.Name);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel principal */}
          <div className="s3-main-panel">
            {selectedBucket ? (
              <>
                {/* Barra de herramientas */}
                <div className="s3-toolbar">
                  <div className="s3-search">
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Buscar objetos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="toolbar-actions">
                    <button className="tool-btn" onClick={() => document.getElementById('file-upload').click()}>
                      <FaUpload /> Subir
                    </button>
                    <button className="tool-btn">
                      <FaFolderPlus /> Nueva Carpeta
                    </button>
                  </div>
                </div>

                {/* Lista de objetos con verificación */}
                <div className={`objects-container ${viewMode} ${openActionMenu ? 'menu-open' : ''}`}>
                  {/* Mostrar carpetas primero */}
                  {objects?.folders?.map(folder => (
                    <div key={folder.path} className="object-item folder" onClick={() => handleNavigate(folder.path)}>
                      <span><FaFolder /> {folder.name}</span>
                    </div>
                  ))}
                  
                  {/* Mostrar archivos después */}
                  {Array.isArray(filteredObjects) && filteredObjects.map((obj) => (
                    <ObjectItem
                      key={obj.Key}
                      object={obj}
                      selectedBucket={selectedBucket}
                      handlePreview={handlePreview}
                      handleDownloadObject={handleDownloadObject}
                      generatePresignedUrl={generatePresignedUrl}
                      handleShowTags={handleShowTags}
                      handleEncryption={handleEncryption}
                      handleDeleteObject={handleDeleteObject}
                      openActionMenu={openActionMenu}
                      setOpenActionMenu={setOpenActionMenu}
                    />
                  ))}

                  {/* Mostrar mensaje si no hay archivos ni carpetas */}
                  {hasNoFolders && hasNoFilteredObjects && (
                    <div className="empty-state">
                      <FaFolder size={48} />
                      <h3>No hay archivos</h3>
                      <p>Este bucket está vacío</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <FaFolder size={48} />
                <h3>Selecciona un bucket</h3>
                <p>Elige un bucket para ver su contenido</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Create bucket modal */}
        {showCreateModal && (
          <div className="s3-modal">
            <div className="s3-modal-content">
              <h2>Crear nuevo bucket</h2>
              <div className="modal-form">
                <div className="form-group">
                  <label>Nombre del bucket</label>
                  <input
                    type="text"
                    placeholder="Nombre del bucket"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Cifrado del bucket</label>
                  <select 
                    value={encryptionSettings.type} 
                    onChange={(e) => setEncryptionSettings(prev => ({
                      ...prev,
                      type: e.target.value,
                      kmsKeyId: e.target.value === 'aws:kms' ? prev.kmsKeyId : ''
                    }))}
                  >
                    <option value="none">Sin cifrado</option>
                    <option value="AES256">AES-256 (SSE-S3)</option>
                    <option value="aws:kms">AWS KMS</option>
                  </select>
                </div>

                {encryptionSettings.type === 'aws:kms' && (
                  <div className="form-group">
                    <label>Clave KMS</label>
                    {loadingKmsKeys ? (
                      <div className="loading-indicator">Cargando claves KMS...</div>
                    ) : (
                      <select
                        value={encryptionSettings.kmsKeyId || ''}
                        onChange={(e) => setEncryptionSettings(prev => ({
                          ...prev,
                          kmsKeyId: e.target.value
                        }))}
                      >
                        <option value="">Seleccione una clave KMS</option>
                        {kmsKeys.map(key => (
                          <option key={key.id} value={key.arn}>
                            {key.description} ({key.id})
                          </option>
                        ))}
                      </select>
                    )}
                    <small className="help-text">
                      Si no selecciona una clave, se usará la clave KMS predeterminada de S3
                    </small>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="s3-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="s3-btn primary"
                  onClick={handleCreateBucket}
                  disabled={!newBucketName}
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de previsualización */}
        {previewFile && (
          <div className="s3-modal preview-modal">
            <div className="s3-modal-content">
              <div className="modal-header">
                <h2>Previsualización: {previewFile.name}</h2>
                <button className="close-button" onClick={() => setPreviewFile(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="preview-content">
                {previewFile.contentType?.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(previewFile.data)} 
                    alt={previewFile.name}
                    className="preview-image"
                  />
                ) : previewFile.contentType === 'application/pdf' ? (
                  <iframe 
                    src={URL.createObjectURL(previewFile.data)}
                    title={previewFile.name}
                    className="preview-pdf"
                  />
                ) : previewFile.contentType?.startsWith('text/') || 
                   previewFile.contentType === 'application/json' ? (
                  <div className="preview-text">
                    <pre>
                      {new TextDecoder().decode(previewFile.data)}
                    </pre>
                  </div>
                ) : previewFile.contentType?.startsWith('video/') ? (
                  <video 
                    src={URL.createObjectURL(previewFile.data)} 
                    controls 
                    className="preview-video"
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : previewFile.contentType?.startsWith('audio/') ? (
                  <audio 
                    src={URL.createObjectURL(previewFile.data)} 
                    controls 
                    className="preview-audio"
                  >
                    Tu navegador no soporta la reproducción de audio.
                  </audio>
                ) : (
                  <div className="preview-unsupported">
                    <p>No se puede previsualizar este tipo de archivo ({previewFile.contentType})</p>
                    <p>Puede descargarlo para verlo en su aplicación correspondiente.</p>
                    <button 
                      className="s3-btn primary"
                      onClick={() => handleDownloadObject(previewFile.name)}
                    >
                      Descargar archivo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de permisos */}
        {showPermissions && (
          <div className="permissions-modal">
            <div className="permissions-content">
              <h2>Permisos del Bucket</h2>
              <div className="policy-editor">
                <textarea
                  value={JSON.stringify(bucketPolicy, null, 2)}
                  onChange={(e) => setBucketPolicy(JSON.parse(e.target.value))}
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowPermissions(false)}>Cancelar</button>
                <button onClick={() => handleUpdatePolicy()}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de versiones */}
        {showVersions && (
          <div className="versions-modal">
            <div className="versions-content">
              <h2>Versiones de {selectedObject}</h2>
              <div className="versions-list">
                {versions.map(version => (
                  <div key={version.VersionId} className="version-item">
                    <div className="version-info">
                      <span>{new Date(version.LastModified).toLocaleString()}</span>
                      <span>{formatBytes(version.Size)}</span>
                    </div>
                    <div className="version-actions">
                      <button onClick={() => handleDownloadVersion(version.VersionId)}>
                        <FaDownload />
                      </button>
                      <button onClick={() => handleRestoreVersion(version.VersionId)}>
                        <FaHistory />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de nueva carpeta */}
        {showNewFolderModal && (
          <div className="s3-modal">
            <div className="s3-modal-content">
              <h2>Crear nueva carpeta</h2>
              <input
                type="text"
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="modal-actions">
                <button onClick={() => setShowNewFolderModal(false)}>
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateFolder}
                  disabled={!newFolderName}
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de metadatos */}
        {showMetadata && (
          <div className="metadata-modal">
            <div className="metadata-content">
              <h2>Metadatos del objeto</h2>
              <div className="metadata-list">
                <div className="metadata-item">
                  <span>Tipo de contenido:</span>
                  <span>{objectMetadata.contentType}</span>
                </div>
                <div className="metadata-item">
                  <span>Tamaño:</span>
                  <span>{formatBytes(objectMetadata.contentLength)}</span>
                </div>
                <div className="metadata-item">
                  <span>Última modificación:</span>
                  <span>{new Date(objectMetadata.lastModified).toLocaleString()}</span>
                </div>
                {/* Metadatos personalizados */}
                {Object.entries(objectMetadata.metadata || {}).map(([key, value]) => (
                  <div key={key} className="metadata-item">
                    <span>{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de tags */}
        {showTagsModal && (
          <div className="tags-modal">
            <div className="tags-content">
              <div className="tags-header">
                <h2>
                  <FaTags /> Etiquetas del objeto
                </h2>
                <button 
                  className="close-preview" 
                  onClick={() => {
                    setShowTagsModal(false);
                    setSelectedObjectTags([]);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="tags-list">
                {(!selectedObjectTags || selectedObjectTags.length === 0) ? (
                  <div className="empty-state" style={{ padding: '2rem 0' }}>
                    <p>No hay etiquetas</p>
                  </div>
                ) : (
                  selectedObjectTags.map((tag, index) => (
                    <div key={index} className="tag-item">
                      <span>{tag.Key}: {tag.Value}</span>
                      <button onClick={() => handleRemoveTag(tag.Key)}>
                        <FaTimes />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="add-tag-form">
                <div className="inputs-container">
                  <input
                    type="text"
                    placeholder="Nombre de la etiqueta"
                    value={newTag.key}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNewTag(prev => ({ ...prev, key: e.target.value }));
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Valor de la etiqueta"
                    value={newTag.value}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNewTag(prev => ({ ...prev, value: e.target.value }));
                    }}
                  />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTag();
                  }}
                  disabled={!newTag.key || !newTag.value}
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de transferencias */}
        {showTransfers && transfers && Array.isArray(transfers) && transfers.length > 0 && (
          <div className="transfers-modal">
            <div className="transfers-content">
              <div className="transfers-header">
                <h2>Transferencias activas</h2>
                <button 
                  className="close-button"
                  onClick={() => {
                    setShowTransfers(false);
                    setTransfers(prev => Array.isArray(prev) ? prev.filter(t => t.status === 'uploading') : []);
                  }}
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
              <div className="transfers-list">
                {transfers.map((transfer, index) => (
                  <TransferProgress key={index} transfer={transfer} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de cifrado */}
        {showEncryptionModal && (
          <div className="s3-modal">
            <div className="s3-modal-content">
              <h2>Configurar Cifrado</h2>
              <div className="encryption-settings">
                <div className="setting-group">
                  <label>Tipo de Cifrado:</label>
                  <select
                    value={encryptionSettings.type}
                    onChange={(e) => setEncryptionSettings(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="AES256">AES-256</option>
                    <option value="aws:kms">AWS KMS</option>
                  </select>
                </div>
                
                {encryptionSettings.type === 'aws:kms' && (
                  <div className="setting-group">
                    <label>ID de Clave KMS:</label>
                    <input
                      type="text"
                      value={encryptionSettings.kmsKeyId || ''}
                      onChange={(e) => setEncryptionSettings(prev => ({
                        ...prev,
                        kmsKeyId: e.target.value
                      }))}
                      placeholder="Ingrese el ID de la clave KMS"
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  className="s3-btn"
                  onClick={() => {
                    setShowEncryptionModal(false);
                    setSelectedObjectForEncryption(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="s3-btn primary"
                  onClick={applyEncryption}
                  disabled={encryptionSettings.type === 'aws:kms' && !encryptionSettings.kmsKeyId}
                >
                  Aplicar Cifrado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de ajustes */}
        {showSettingsModal && renderSettingsModal()}

        {/* Menú de acciones */}
        {openMenuKey && (
          <div className={`menu ${menuPosition === 'up' ? 'menu-up' : 'menu-down'}`}>
            <button className="menu-item" onClick={(e) => {
              e.stopPropagation();
              handleDeleteBucket(selectedBucket);
            }}>
              <i className="fas fa-trash"></i> Eliminar bucket
            </button>
            <button className="menu-item" onClick={(e) => {
              e.stopPropagation();
              handleConfigureCors(selectedBucket);
            }}>
              <i className="fas fa-cog"></i> Configurar CORS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

S3Manager.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default S3Manager; 