"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchMediaLibrary,
  removeMedia,
  saveMediaDetails,
  uploadMedia,
} from "@/app/admin/media/actions";
import { fromMediaDTO } from "@/lib/admin/media.dto";
import {
  formatFileSize,
  formatMediaDate,
  getUploadDateOptions,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  type MediaAttachment,
} from "@/lib/admin/mediaLibrary";

export function useMediaLibrary(isActive = true) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [libraryItems, setLibraryItems] = useState<MediaAttachment[]>([]);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("images");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setUploadError("");

    try {
      const result = await fetchMediaLibrary();
      setLibraryItems(result.items.map(fromMediaDTO));
      setSource(result.source);
    } catch {
      setUploadError("Could not load the media library.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadLibrary();
  }, [isActive, loadLibrary]);

  const selectedAttachment = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return libraryItems.find((item) => item.id === selectedId) ?? null;
  }, [libraryItems, selectedId]);

  const dateOptions = useMemo(
    () => getUploadDateOptions(libraryItems),
    [libraryItems],
  );

  const filteredLibraryItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return libraryItems.filter((item) => {
      if (typeFilter === "images" && !item.mimeType.startsWith("image/")) {
        return false;
      }

      if (dateFilter !== "all") {
        const itemKey = `${item.uploadedAt.getFullYear()}-${item.uploadedAt.getMonth()}`;

        if (itemKey !== dateFilter) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(query) ||
        item.filename.toLowerCase().includes(query) ||
        item.alt.toLowerCase().includes(query)
      );
    });
  }, [dateFilter, libraryItems, searchQuery, typeFilter]);

  const handleSelectAttachment = useCallback((attachment: MediaAttachment) => {
    setSelectedId(attachment.id);
  }, []);

  const persistAttachment = useCallback(async (attachment: MediaAttachment) => {
    const dto = {
      ...attachment,
      uploadedAt: attachment.uploadedAt.toISOString(),
    };
    const result = await saveMediaDetails(dto);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    if (result.item) {
      const saved = fromMediaDTO(result.item);
      setLibraryItems((items) =>
        items.map((item) => (item.id === saved.id ? saved : item)),
      );
      setStatusMessage("Saved.");
      window.setTimeout(() => setStatusMessage(""), 2000);
    }
  }, []);

  const handleAttachmentChange = useCallback((attachment: MediaAttachment) => {
    setLibraryItems((items) =>
      items.map((item) => (item.id === attachment.id ? attachment : item)),
    );
  }, []);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (fileArray.length === 0) {
        setUploadError("Please choose an image file.");
        return;
      }

      const file = fileArray[0];

      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        setUploadError("This file exceeds the maximum upload size of 256 MB.");
        return;
      }

      setUploadError("");
      setIsLoading(true);

      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMedia(formData);
      setIsLoading(false);

      if (result.error || !result.item) {
        setUploadError(result.error ?? "Upload failed.");
        return;
      }

      const attachment = fromMediaDTO(result.item);
      setLibraryItems((items) => [attachment, ...items]);
      setSelectedId(attachment.id);
      setSource("supabase");
      setStatusMessage("Uploaded to Supabase.");
      window.setTimeout(() => setStatusMessage(""), 2000);
    },
    [],
  );

  const handleDeleteAttachment = useCallback(async (id: string) => {
    const result = await removeMedia(id);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    setLibraryItems((items) => items.filter((item) => item.id !== id));
    setSelectedId(null);
    setStatusMessage("Deleted.");
    window.setTimeout(() => setStatusMessage(""), 2000);
  }, []);

  return {
    fileInputRef,
    libraryItems,
    source,
    selectedAttachment,
    selectedId,
    setSelectedId,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    searchQuery,
    setSearchQuery,
    isDragging,
    setIsDragging,
    uploadError,
    isLoading,
    statusMessage,
    dateOptions,
    filteredLibraryItems,
    loadLibrary,
    handleSelectAttachment,
    handleAttachmentChange,
    persistAttachment,
    processFiles,
    handleDeleteAttachment,
    formatFileSize,
    formatMediaDate,
  };
}
