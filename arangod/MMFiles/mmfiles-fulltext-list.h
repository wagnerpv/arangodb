////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2014-2016 ArangoDB GmbH, Cologne, Germany
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Jan Steemann
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGOD_MMFILES_MMFILES_FULLTEXT_LIST_H
#define ARANGOD_MMFILES_MMFILES_FULLTEXT_LIST_H 1

#include "mmfiles-fulltext-common.h"

/// @brief typedef for a fulltext list
typedef void TRI_fulltext_list_t;

/// @brief typedef for a fulltext list entry
typedef uint32_t TRI_fulltext_list_entry_t;

/// @brief clone a list
TRI_fulltext_list_t* TRI_CloneListMMFilesFulltextIndex(TRI_fulltext_list_t const*);

/// @brief create a list
TRI_fulltext_list_t* TRI_CreateListMMFilesFulltextIndex(uint32_t);

/// @brief free a list
void TRI_FreeListMMFilesFulltextIndex(TRI_fulltext_list_t*);

/// @brief get the memory usage of a list
size_t TRI_MemoryListMMFilesFulltextIndex(TRI_fulltext_list_t const*);

/// @brief unionise two lists
/// this will create a new list and free both lhs & rhs
TRI_fulltext_list_t* TRI_UnioniseListMMFilesFulltextIndex(TRI_fulltext_list_t*,
                                                   TRI_fulltext_list_t*);

/// @brief intersect two lists
/// this will create a new list and free both lhs & rhs
TRI_fulltext_list_t* TRI_IntersectListMMFilesFulltextIndex(TRI_fulltext_list_t*,
                                                    TRI_fulltext_list_t*);

/// @brief exclude values from a list
/// this will modify the result in place
TRI_fulltext_list_t* TRI_ExcludeListMMFilesFulltextIndex(TRI_fulltext_list_t*,
                                                  TRI_fulltext_list_t*);

/// @brief insert an element into a list
/// this might free the old list and allocate a new, bigger one
TRI_fulltext_list_t* TRI_InsertListMMFilesFulltextIndex(
    TRI_fulltext_list_t*, const TRI_fulltext_list_entry_t);

/// @brief rewrites the list of entries using a map of values
/// returns the number of entries remaining in the list after rewrite
uint32_t TRI_RewriteListMMFilesFulltextIndex(TRI_fulltext_list_t*, void const*);

/// @brief dump a list
#if TRI_FULLTEXT_DEBUG
void TRI_DumpListMMFilesFulltextIndex(TRI_fulltext_list_t const*);
#endif

/// @brief return the number of entries
uint32_t TRI_NumEntriesListMMFilesFulltextIndex(TRI_fulltext_list_t const*);

/// @brief return a pointer to the first list entry
TRI_fulltext_list_entry_t* TRI_StartListMMFilesFulltextIndex(
    TRI_fulltext_list_t const*);

#endif
