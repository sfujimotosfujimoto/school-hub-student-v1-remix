import React from "react"
import type { DriveFile } from "~/types"

/**
 * TYPES
 */
type SetAction = {
  type: "SET"
  payload: {
    driveFiles: DriveFile[]
  }
}

type FilterBySegmentAction = {
  type: "FILTER_BY_SEGMENT"
  payload: {
    segment: string
    driveFiles: DriveFile[]
  }
}

type FilterByExtensionAction = {
  type: "FILTER_BY_EXTENSION"
  payload: {
    extension: string
    driveFiles: DriveFile[]
  }
}

type FilterByNendoAction = {
  type: "FILTER_BY_NENDO"
  payload: {
    nendo: string
    driveFiles: DriveFile[]
  }
}

type FilterByTagAction = {
  type: "FILTER_BY_TAG"
  payload: {
    tag: string
    driveFiles: DriveFile[]
  }
}

export type Action =
  | SetAction
  | FilterBySegmentAction
  | FilterByExtensionAction
  | FilterByNendoAction
  | FilterByTagAction

/**
 * REDUCER
 */
function driveFilesReducer(dfs: DriveFile[], action: Action): DriveFile[] {
  switch (action.type) {
    case "SET": {
      return action.payload.driveFiles
    }

    case "FILTER_BY_SEGMENT": {
      const baseDriveFiles = action.payload.driveFiles as DriveFile[]
      return baseDriveFiles.filter((df) => {
        const currentSegments = df.name.split(/[-_.]/)
        return currentSegments.includes(action.payload.segment)
      })
    }

    case "FILTER_BY_EXTENSION": {
      const baseDriveFiles = action.payload.driveFiles as DriveFile[]
      const filtered = baseDriveFiles.filter((df) => {
        const currentExt = df.mimeType.split(/[/.]/).at(-1)
        return currentExt === action.payload.extension
      })
      if (!filtered || !action.payload.extension) {
        return dfs
      } else {
        return filtered
      }
    }
    case "FILTER_BY_NENDO": {
      const nendo = action.payload.nendo
      const baseDriveFiles = action.payload.driveFiles as DriveFile[]
      const filtered = baseDriveFiles.filter((df) => {
        const props = JSON.parse(df.appProperties || "[]")
        return props.nendo === nendo
      })

      if (!filtered || !nendo) {
        return dfs
      } else {
        return filtered
      }
    }

    case "FILTER_BY_TAG": {
      const tag = action.payload.tag
      const baseDriveFiles = action.payload.driveFiles as DriveFile[]
      console.log("tag", tag)

      const filtered = baseDriveFiles.filter((df) => {
        const props = JSON.parse(df.appProperties || "[]")
        const tags = props.tags?.split(",").map((t: string) => t.trim())
        console.log("tags", tags)
        return tags?.includes(tag)
      })

      if (!filtered || !tag) {
        return dfs
      } else {
        return filtered
      }
    }
    default:
      return dfs
  }
}

/**
 * CONTEXT
 */
const DriveFilesContext = React.createContext<DriveFile[]>([])
const DriveFilesDispatchContext = React.createContext<React.Dispatch<Action>>(
  () => {},
)

/**
 * PROVIDER
 */
function DriveFilesProvider({ children }: { children: React.ReactNode }) {
  const initialState: DriveFile[] = []
  const [driveFiles, dispatch] = React.useReducer(
    driveFilesReducer,
    initialState,
  )

  return (
    <DriveFilesContext.Provider value={driveFiles}>
      <DriveFilesDispatchContext.Provider value={dispatch}>
        {children}
      </DriveFilesDispatchContext.Provider>
    </DriveFilesContext.Provider>
  )
}

export default DriveFilesProvider

/**
 * HOOKS
 */
export function useDriveFilesContext() {
  const driveFiles = React.useContext(DriveFilesContext)

  const driveFilesDispatch = React.useContext(DriveFilesDispatchContext)

  if (driveFiles === undefined || driveFilesDispatch === undefined) {
    throw new Error("useDriveFiles must be used within a DriveFilesProvider")
  }
  return { driveFiles, driveFilesDispatch }
}
