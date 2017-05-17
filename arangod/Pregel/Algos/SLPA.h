////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2017 ArangoDB GmbH, Cologne, Germany
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
/// @author Simon Grätzer
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGODB_PREGEL_ALGOS_SLPA_H
#define ARANGODB_PREGEL_ALGOS_SLPA_H 1

#include <cmath>
#include "Pregel/Algorithm.h"
#include "Pregel/CommonFormats.h"

namespace arangodb {
namespace pregel {
namespace algos {

/// SLPA algorithm:
/// Overlap is one of the characteristics of social
/// networks, in which a person may belong to more than one social
/// group. For this reason, discovering overlapping structure
/// is  necessary  for  realistic  social  analysis.  In the SLPA algorithm
/// nodes  exchange  labels  according  to  dynamic
/// interaction  rules.  It has excellent performance in identifying both
/// overlapping
/// nodes and  overlapping  communities  with  different  degrees  of diversity.
struct SLPA : public SimpleAlgorithm<SLPAValue, int8_t, uint64_t> {
  unsigned _maxCommunities = 1;
  double _threshold = 0.15;

 public:
  explicit SLPA(VPackSlice userParams)
      : SimpleAlgorithm<SLPAValue, int8_t, uint64_t>("slpa", userParams) {
    arangodb::velocypack::Slice field = userParams.get("threshold");
    if (field.isNumber()) {
      _threshold = std::min(1.0, std::max(field.getDouble(), 0.0));
    }
    field = userParams.get("maxCommunities");
    if (field.isInteger()) {
      _threshold = (unsigned)std::min(32ULL, std::max(field.getUInt(), 0ULL));
    }
  }

  GraphFormat<SLPAValue, int8_t>* inputFormat() const override;
  MessageFormat<uint64_t>* messageFormat() const override {
    return new NumberMessageFormat<uint64_t>();
  }

  VertexComputation<SLPAValue, int8_t, uint64_t>* createComputation(
      WorkerConfig const*) const override;
};
}
}
}
#endif
