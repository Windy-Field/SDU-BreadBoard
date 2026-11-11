(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // node_modules/javascript-astar/astar.js
  var require_astar = __commonJS({
    "node_modules/javascript-astar/astar.js"(exports, module) {
      (function(definition) {
        if (typeof module === "object" && typeof module.exports === "object") {
          module.exports = definition();
        } else if (typeof define === "function" && define.amd) {
          define([], definition);
        } else {
          var exports2 = definition();
          window.astar = exports2.astar;
          window.Graph = exports2.Graph;
        }
      })(function() {
        function pathTo(node2) {
          var curr = node2, path = [];
          while (curr.parent) {
            path.unshift(curr);
            curr = curr.parent;
          }
          return path;
        }
        function getHeap() {
          return new BinaryHeap(function(node2) {
            return node2.f;
          });
        }
        var astar = {
          /**
          * Perform an A* Search on a graph given a start and end node.
          * @param {Graph} graph
          * @param {GridNode} start
          * @param {GridNode} end
          * @param {Object} [options]
          * @param {bool} [options.closest] Specifies whether to return the
                     path to the closest node if the target is unreachable.
          * @param {Function} [options.heuristic] Heuristic function (see
          *          astar.heuristics).
          */
          search: function(graph, start2, end, options) {
            graph.cleanDirty();
            options = options || {};
            var heuristic = options.heuristic || astar.heuristics.manhattan, closest = options.closest || false;
            var openHeap = getHeap(), closestNode = start2;
            start2.h = heuristic(start2, end);
            openHeap.push(start2);
            while (openHeap.size() > 0) {
              var currentNode = openHeap.pop();
              if (currentNode === end) {
                return pathTo(currentNode);
              }
              currentNode.closed = true;
              var neighbors = graph.neighbors(currentNode);
              for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall()) {
                  continue;
                }
                var gScore = currentNode.g + neighbor.getCost(currentNode), beenVisited = neighbor.visited;
                if (!beenVisited || gScore < neighbor.g) {
                  neighbor.visited = true;
                  neighbor.parent = currentNode;
                  neighbor.h = neighbor.h || heuristic(neighbor, end);
                  neighbor.g = gScore;
                  neighbor.f = neighbor.g + neighbor.h;
                  graph.markDirty(neighbor);
                  if (closest) {
                    if (neighbor.h < closestNode.h || neighbor.h === closestNode.h && neighbor.g < closestNode.g) {
                      closestNode = neighbor;
                    }
                  }
                  if (!beenVisited) {
                    openHeap.push(neighbor);
                  } else {
                    openHeap.rescoreElement(neighbor);
                  }
                }
              }
            }
            if (closest) {
              return pathTo(closestNode);
            }
            return [];
          },
          // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
          heuristics: {
            manhattan: function(pos0, pos1) {
              var d1 = Math.abs(pos1.x - pos0.x);
              var d2 = Math.abs(pos1.y - pos0.y);
              return d1 + d2;
            },
            diagonal: function(pos0, pos1) {
              var D2 = 1;
              var D22 = Math.sqrt(2);
              var d1 = Math.abs(pos1.x - pos0.x);
              var d2 = Math.abs(pos1.y - pos0.y);
              return D2 * (d1 + d2) + (D22 - 2 * D2) * Math.min(d1, d2);
            }
          },
          cleanNode: function(node2) {
            node2.f = 0;
            node2.g = 0;
            node2.h = 0;
            node2.visited = false;
            node2.closed = false;
            node2.parent = null;
          }
        };
        function Graph(gridIn, options) {
          options = options || {};
          this.nodes = [];
          this.diagonal = !!options.diagonal;
          this.grid = [];
          for (var x2 = 0; x2 < gridIn.length; x2++) {
            this.grid[x2] = [];
            for (var y2 = 0, row = gridIn[x2]; y2 < row.length; y2++) {
              var node2 = new GridNode(x2, y2, row[y2]);
              this.grid[x2][y2] = node2;
              this.nodes.push(node2);
            }
          }
          this.init();
        }
        Graph.prototype.init = function() {
          this.dirtyNodes = [];
          for (var i = 0; i < this.nodes.length; i++) {
            astar.cleanNode(this.nodes[i]);
          }
        };
        Graph.prototype.cleanDirty = function() {
          for (var i = 0; i < this.dirtyNodes.length; i++) {
            astar.cleanNode(this.dirtyNodes[i]);
          }
          this.dirtyNodes = [];
        };
        Graph.prototype.markDirty = function(node2) {
          this.dirtyNodes.push(node2);
        };
        Graph.prototype.neighbors = function(node2) {
          var ret = [], x2 = node2.x, y2 = node2.y, grid = this.grid;
          if (grid[x2 - 1] && grid[x2 - 1][y2]) {
            ret.push(grid[x2 - 1][y2]);
          }
          if (grid[x2 + 1] && grid[x2 + 1][y2]) {
            ret.push(grid[x2 + 1][y2]);
          }
          if (grid[x2] && grid[x2][y2 - 1]) {
            ret.push(grid[x2][y2 - 1]);
          }
          if (grid[x2] && grid[x2][y2 + 1]) {
            ret.push(grid[x2][y2 + 1]);
          }
          if (this.diagonal) {
            if (grid[x2 - 1] && grid[x2 - 1][y2 - 1]) {
              ret.push(grid[x2 - 1][y2 - 1]);
            }
            if (grid[x2 + 1] && grid[x2 + 1][y2 - 1]) {
              ret.push(grid[x2 + 1][y2 - 1]);
            }
            if (grid[x2 - 1] && grid[x2 - 1][y2 + 1]) {
              ret.push(grid[x2 - 1][y2 + 1]);
            }
            if (grid[x2 + 1] && grid[x2 + 1][y2 + 1]) {
              ret.push(grid[x2 + 1][y2 + 1]);
            }
          }
          return ret;
        };
        Graph.prototype.toString = function() {
          var graphString = [], nodes = this.grid, rowDebug, row, y2, l2;
          for (var x2 = 0, len = nodes.length; x2 < len; x2++) {
            rowDebug = [];
            row = nodes[x2];
            for (y2 = 0, l2 = row.length; y2 < l2; y2++) {
              rowDebug.push(row[y2].weight);
            }
            graphString.push(rowDebug.join(" "));
          }
          return graphString.join("\n");
        };
        function GridNode(x2, y2, weight) {
          this.x = x2;
          this.y = y2;
          this.weight = weight;
        }
        GridNode.prototype.toString = function() {
          return "[" + this.x + " " + this.y + "]";
        };
        GridNode.prototype.getCost = function(fromNeighbor) {
          if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
            return this.weight * 1.41421;
          }
          return this.weight;
        };
        GridNode.prototype.isWall = function() {
          return this.weight === 0;
        };
        function BinaryHeap(scoreFunction) {
          this.content = [];
          this.scoreFunction = scoreFunction;
        }
        BinaryHeap.prototype = {
          push: function(element2) {
            this.content.push(element2);
            this.sinkDown(this.content.length - 1);
          },
          pop: function() {
            var result = this.content[0];
            var end = this.content.pop();
            if (this.content.length > 0) {
              this.content[0] = end;
              this.bubbleUp(0);
            }
            return result;
          },
          remove: function(node2) {
            var i = this.content.indexOf(node2);
            var end = this.content.pop();
            if (i !== this.content.length - 1) {
              this.content[i] = end;
              if (this.scoreFunction(end) < this.scoreFunction(node2)) {
                this.sinkDown(i);
              } else {
                this.bubbleUp(i);
              }
            }
          },
          size: function() {
            return this.content.length;
          },
          rescoreElement: function(node2) {
            this.sinkDown(this.content.indexOf(node2));
          },
          sinkDown: function(n) {
            var element2 = this.content[n];
            while (n > 0) {
              var parentN = (n + 1 >> 1) - 1, parent = this.content[parentN];
              if (this.scoreFunction(element2) < this.scoreFunction(parent)) {
                this.content[parentN] = element2;
                this.content[n] = parent;
                n = parentN;
              } else {
                break;
              }
            }
          },
          bubbleUp: function(n) {
            var length = this.content.length, element2 = this.content[n], elemScore = this.scoreFunction(element2);
            while (true) {
              var child2N = n + 1 << 1, child1N = child2N - 1;
              var swap = null, child1Score;
              if (child1N < length) {
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);
                if (child1Score < elemScore) {
                  swap = child1N;
                }
              }
              if (child2N < length) {
                var child2 = this.content[child2N], child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                  swap = child2N;
                }
              }
              if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element2;
                n = swap;
              } else {
                break;
              }
            }
          }
        };
        return {
          astar,
          Graph
        };
      });
    }
  });

  // src/dom.mjs
  function element(id) {
    return document.getElementById(id);
  }
  function node(tag, text2, className) {
    const result = document.createElement(tag);
    result.textContent = text2;
    if (className !== "") {
      result.className = className;
    }
    return result;
  }
  function icon(name) {
    const result = document.createElement("i");
    result.dataset.lucide = name;
    result.setAttribute("aria-hidden", "true");
    return result;
  }
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // src/document-references.mjs
  var DOCUMENT_REFERENCES = {
    "74LS03": {
      "image": "assets/pinouts/document/74ls03-1.png",
      "logicImage": "assets/pinouts/document/74ls03-2.png",
      "summary": "\u903B\u8F91\u529F\u80FD\u4E0E74LS00\u76F8\u540C\uFF0CY=(AB)\u2032\uFF0C\u4F46\u8F93\u51FA\u7EA7\u4E3A\u96C6\u7535\u6781\u5F00\u8DEF\uFF08OC\uFF09\u7ED3\u6784\uFF0C\u4F7F\u7528\u65F6\u8F93\u51FA\u7AEF\u5FC5\u987B\u5916\u63A5\u4E0A\u62C9\u7535\u963B\u3002OC\u95E8\u53EF\u4EE5\u628A\u591A\u4E2A\u8F93\u51FA\u76F4\u63A5\u5E76\u8054\u5B9E\u73B0\u201C\u7EBF\u4E0E\u201D\uFF0C\u5E38\u7528\u4E8E\u603B\u7EBF\u9A71\u52A8\u548C\u7535\u5E73\u8F6C\u6362"
    },
    "74LS20": {
      "image": "assets/pinouts/document/74ls20-1.png",
      "logicImage": "assets/pinouts/document/74ls20-2.png",
      "summary": "\u7247\u5185\u67092\u4E2A\u72EC\u7ACB\u76844\u8F93\u5165\u4E0E\u975E\u95E8\uFF0CY=(ABCD)\u2032\u3002\u5B9E\u9A8C4\u4E2D\u7528\u5B83\u4E0E74LS138\u914D\u5408\u5B9E\u73B0\u7EC4\u5408\u903B\u8F91\u51FD\u6570\uFF1B\u628A\u591A\u4F59\u8F93\u5165\u7AEF\u63A5\u9AD8\u7535\u5E73\u6216\u5C06\u8F93\u5165\u7AEF\u5E76\u63A5\uFF0C\u4E5F\u53EF\u5F53\u4F5C\u53CD\u76F8\u5668\u4F7F\u7528"
    },
    "CD4011": {
      "image": "assets/pinouts/document/cd4011-1.png",
      "logicImage": "assets/pinouts/document/cd4011-2.png",
      "summary": "CMOS\u5DE5\u827A\u7684\u56DB2\u8F93\u5165\u4E0E\u975E\u95E8\uFF0CY=(AB)\u2032\u3002\u7535\u6E90\u7535\u538B\u8303\u56F4\u5BBD\uFF083~15V\uFF09\uFF0C\u8F93\u5165\u963B\u6297\u6781\u9AD8\u3001\u9759\u6001\u529F\u8017\u6781\u5C0F\uFF0C\u4F46\u591A\u4F59\u8F93\u5165\u7AEF\u4E0D\u5141\u8BB8\u60AC\u7A7A\uFF0C\u5FC5\u987B\u63A5VDD\u6216VSS\u3002\u5B9E\u9A8C2\u4E2D\u7528\u4E8E\u6D4B\u91CFCMOS\u95E8\u7684\u7535\u538B\u4F20\u8F93\u7279\u6027\u548C\u4F20\u8F93\u5EF6\u8FDF\u65F6\u95F4"
    },
    "74LS125": {
      "image": "assets/pinouts/document/74ls125-1.png",
      "logicImage": "assets/pinouts/document/74ls125-2.png",
      "summary": "\u7247\u5185\u67094\u4E2A\u72EC\u7ACB\u7684\u4E09\u6001\u7F13\u51B2\u95E8\uFF0C\u4F7F\u80FD\u7AEFG\u2032\u4F4E\u7535\u5E73\u6709\u6548\uFF1AG\u2032=0\u65F6Y=A\uFF08\u540C\u76F8\u8F93\u51FA\uFF09\uFF0CG\u2032=1\u65F6\u8F93\u51FA\u4E3A\u9AD8\u963B\u6001\u3002\u5E38\u7528\u4E8E\u603B\u7EBF\u7ED3\u6784\u3001\u6570\u636E\u9009\u62E9\u4E0E\u4FE1\u53F7\u9694\u79BB"
    },
    "74LS138": {
      "image": "assets/pinouts/document/74ls138-1.png",
      "logicImage": "assets/pinouts/document/74ls138-2.png",
      "summary": "3\u4E2A\u5730\u5740\u8F93\u5165\u7AEFA2A1A0\uFF0C8\u4E2A\u4F4E\u7535\u5E73\u6709\u6548\u7684\u8F93\u51FA\u7AEFY0\u2032~Y7\u2032\uFF0C3\u4E2A\u4F7F\u80FD\u7AEFS1\uFF08\u9AD8\u6709\u6548\uFF09\u3001S2\u2032\u3001S3\u2032\uFF08\u4F4E\u6709\u6548\uFF09\u3002\u5F53S1=1\u4E14S2\u2032+S3\u2032=0\u65F6\u8BD1\u7801\uFF0CYi\u2032=(mi\xB7S)\u2032\uFF0C\u88AB\u9009\u4E2D\u7AEF\u8F93\u51FA\u4F4E\u7535\u5E73\uFF1B\u7981\u6B62\u65F6\u8F93\u51FA\u5168\u4E3A\u9AD8\u3002\u53EF\u4F5C\u5730\u5740\u8BD1\u7801\u5668\u3001\u8109\u51B2\u5206\u914D\u5668\uFF0C\u914D\u4E0E\u975E\u95E8\u53EF\u5B9E\u73B0\u4EFB\u610F\u4E09\u53D8\u91CF\u7EC4\u5408\u903B\u8F91\u51FD\u6570"
    },
    "74LS139": {
      "image": "assets/pinouts/document/74ls139-1.png",
      "logicImage": "assets/pinouts/document/74ls139-2.png",
      "summary": "\u7247\u5185\u4E24\u4E2A\u5B8C\u5168\u72EC\u7ACB\u76842\u7EBF-4\u7EBF\u8BD1\u7801\u5668\uFF0C\u5404\u6709\u4F7F\u80FD\u7AEF1G\u2032/2G\u2032\uFF08\u4F4E\u6709\u6548\uFF09\u3001\u5730\u5740\u7AEF1A/1B\uFF082A/2B\uFF0CA\u4E3A\u4F4E\u4F4D\u3001B\u4E3A\u9AD8\u4F4D\uFF09\u548C4\u4E2A\u4F4E\u7535\u5E73\u6709\u6548\u8F93\u51FA\u7AEF\u3002\u5F53G\u2032=0\u65F6\u6309\u5730\u5740\u9009\u4E2D\u4E00\u4E2A\u8F93\u51FA\u4E3A\u4F4E\u7535\u5E73\u3002\u7528\u4E24\u7247\u534A\u7247\u5E76\u63A5\u5730\u5740\u3001A2\u4F5C\u7247\u9009\uFF08\u7ECF\u53CD\u76F8\uFF09\u53EF\u6269\u5C55\u62103\u7EBF-8\u7EBF\u8BD1\u7801\u5668"
    },
    "74LS151": {
      "image": "assets/pinouts/document/74ls151-1.png",
      "logicImage": "assets/pinouts/document/74ls151-2.png",
      "summary": "8\u4E2A\u6570\u636E\u7AEFD0~D7\u30013\u4E2A\u5730\u5740\u7AEFC\uFF08\u6700\u9AD8\u4F4D\uFF09\u3001B\u3001A\uFF08\u6700\u4F4E\u4F4D\uFF09\u3001\u4F4E\u7535\u5E73\u6709\u6548\u7684\u4F7F\u80FD\u7AEFG\u2032\uFF0C\u4EE5\u53CA\u4E92\u8865\u8F93\u51FAY\u3001W\u2032\u3002G\u2032=0\u65F6Y=Di\uFF08i=CBA\uFF09\uFF0CG\u2032=1\u65F6Y=0\u3002\u53EF\u5B9E\u73B0\u4EFB\u610F\u4E09\u53D8\u91CF\u51FD\u6570\uFF1A\u6309F(mi)\u7684\u53D6\u503C\u628ADi\u63A51\u62160\u5373\u53EF"
    },
    "74LS153": {
      "image": "assets/pinouts/document/74ls153-1.png",
      "logicImage": "assets/pinouts/document/74ls153-2.png",
      "summary": "\u7247\u5185\u4E24\u4E2A4\u90091\u9009\u62E9\u5668\uFF0C\u5171\u7528\u5730\u5740\u7AEFA\uFF08\u4F4E\u4F4D\uFF09\u3001B\uFF08\u9AD8\u4F4D\uFF09\uFF0C\u5404\u6709\u72EC\u7ACB\u7684\u4F7F\u80FD\u7AEF1G\u2032/2G\u2032\u548C\u6570\u636E\u8F93\u5165\u7AEF1C0~1C3\u30012C0~2C3\u3002G\u2032=0\u65F6Y=Ci\uFF08i=BA\uFF09\uFF0CG\u2032=1\u65F6Y=0\u3002\u53EF\u7528\u4E24\u7247\uFF08\u6216\u591A\u6B21\u590D\u7528\uFF09\u5B9E\u73B0\u56DB\u53D8\u91CF\u51FD\u6570"
    },
    "74LS85": {
      "image": "assets/pinouts/document/74ls85-1.png",
      "logicImage": "assets/pinouts/document/74ls85-2.png",
      "summary": "\u6BD4\u8F83A3A2A1A0\u4E0EB3B2B1B0\uFF0C\u8F93\u51FAA>B\u3001A=B\u3001A<B\u4E09\u4E2A\u9AD8\u7535\u5E73\u6709\u6548\u4FE1\u53F7\u30022~4\u811A\u4E3A\u7EA7\u8054\u8F93\u5165\uFF0C\u5355\u7247\u4F7F\u7528\u65F6A>B\u3001A<B\u8F93\u5165\u63A50\u3001A=B\u8F93\u5165\u63A51\uFF1B\u4E24\u7247\u7EA7\u8054\u53EF\u6269\u5C55\u62108\u4F4D\u6BD4\u8F83\u5668"
    },
    "74LS48": {
      "image": "assets/pinouts/document/74ls48-1.png",
      "logicImage": "assets/pinouts/document/74ls48-2.png",
      "summary": "\u628A8421BCD\u7801\uFF08D\u4E3A\u6700\u9AD8\u4F4D\u3001A\u4E3A\u6700\u4F4E\u4F4D\uFF09\u8BD1\u6210\u4E03\u6BB5\u5B57\u5F62\uFF0C\u8F93\u51FAa~g\u9AD8\u7535\u5E73\u6709\u6548\uFF0C\u53EF\u76F4\u63A5\u9A71\u52A8\u5171\u9634\u6781\u6570\u7801\u7BA1\uFF0C\u5185\u90E8\u67092k\u03A9\u4E0A\u62C9\u7535\u963B\u3002\u5177\u6709LT\u2032\u706F\u6D4B\u8BD5\u3001RBI\u2032\u706D\u96F6\u8F93\u5165\u3001BI\u2032/RBO\u2032\u706D\u706F\u8F93\u5165/\u52A8\u6001\u706D\u706F\u8F93\u51FA\u529F\u80FD"
    },
    "74LS74": {
      "image": "assets/pinouts/document/74ls74-1.png",
      "logicImage": "assets/pinouts/document/74ls74-2.png",
      "summary": "\u7247\u5185\u4E24\u4E2A\u72EC\u7ACB\u7684\u4E0A\u5347\u6CBF\u89E6\u53D1D\u89E6\u53D1\u5668\uFF0C\u5E26\u5F02\u6B65\u7F6E\u4F4D\u7AEFSD\u2032\uFF08\u4F4E\u6709\u6548\uFF09\u548C\u5F02\u6B65\u590D\u4F4D\u7AEFRD\u2032\uFF08\u4F4E\u6709\u6548\uFF09\u3002CP\u4E0A\u5347\u6CBF\u5230\u6765\u65F6Q*=D\u3002\u53EF\u6784\u6210\u79FB\u4F4D\u5BC4\u5B58\u5668\u3001\u8BA1\u6570\u5668\u548C\u5206\u9891\u7535\u8DEF"
    },
    "74LS112": {
      "image": "assets/pinouts/document/74ls112-1.png",
      "logicImage": "assets/pinouts/document/74ls112-2.png",
      "summary": "\u7247\u5185\u4E24\u4E2A\u72EC\u7ACB\u7684\u4E0B\u964D\u6CBF\u89E6\u53D1JK\u89E6\u53D1\u5668\uFF0C\u5E26\u5F02\u6B65\u7F6E\u4F4D\u7AEFSD\u2032\u548C\u5F02\u6B65\u590D\u4F4D\u7AEFRD\u2032\uFF08\u5747\u4F4E\u6709\u6548\uFF09\u3002J=K=1\u65F6CP\u4E0B\u964D\u6CBF\u7FFB\u8F6C\uFF08T\u2032\u529F\u80FD\uFF09\uFF0C\u53EF\u6784\u6210\u8BA1\u6570\u5668\uFF1B\u4E0E74LS74\u914D\u5408\u53EF\u505A\u89E6\u53D1\u5668\u76F8\u4E92\u8F6C\u6362\u5B9E\u9A8C"
    },
    "CD4027": {
      "image": "assets/pinouts/document/cd4027-1.png",
      "logicImage": "assets/pinouts/document/cd4027-2.png",
      "summary": "CMOS\u53CCJK\u4E3B\u4ECE\u89E6\u53D1\u5668\uFF0C\u4E0A\u5347\u6CBF\u89E6\u53D1\uFF0C\u7F6E\u4F4D\u7AEFSET\u548C\u590D\u4F4D\u7AEFRESET\u4E3A\u9AD8\u7535\u5E73\u6709\u6548\uFF08\u4E0E\u65F6\u949F\u65E0\u5173\uFF09\u3002\u7535\u6E903~15V\uFF0C\u8F93\u5165\u963B\u6297\u9AD8\u3001\u529F\u8017\u4F4E\u3002\u6CE8\u610F\u5176\u7F6E\u4F4D/\u590D\u4F4D\u6781\u6027\u548C\u5F15\u811A\u6392\u5217\u4E0E74LS112\u4E0D\u540C"
    },
    "74LS160": {
      "image": "assets/pinouts/document/74ls160-1.png",
      "logicImage": "assets/pinouts/document/74ls160-2.png",
      "summary": "\u6A2110\u540C\u6B65\u52A0\u8BA1\u6570\u5668\u3002\u5177\u6709\u5F02\u6B65\u6E05\u96F6CLR\u2032\uFF08\u4F4E\u6709\u6548\uFF09\u3001\u540C\u6B65\u7F6E\u6570LOAD\u2032\uFF08\u4F4E\u6709\u6548\uFF09\u3001\u8BA1\u6570\u4F7F\u80FDENP/ENT\u548C\u8FDB\u4F4D\u8F93\u51FARCO\u3002ENP\u3001ENT\u5747\u4E3A\u9AD8\u7535\u5E73\u65F6\u5728CP\u4E0A\u5347\u6CBF\u8BA1\u6570\uFF1BRCO\u5728\u8BA1\u6570\u503C\u4E3A9\u4E14ENT=1\u65F6\u8F93\u51FA\u9AD8\u7535\u5E73"
    },
    "74LS161": {
      "image": "assets/pinouts/document/74ls161-1.png",
      "logicImage": "assets/pinouts/document/74ls161-2.png",
      "summary": "\u6A2116\u540C\u6B65\u52A0\u8BA1\u6570\u5668\uFF0C\u5F15\u811A\u4E0E74LS160\u5B8C\u5168\u76F8\u540C\u3002\u5F02\u6B65\u6E05\u96F6CLR\u2032\u3001\u540C\u6B65\u7F6E\u6570LOAD\u2032\u3001\u4F7F\u80FDENP/ENT\uFF0C\u8FDB\u4F4D\u8F93\u51FARCO\u3002\u53EF\u7528\u4E8E\u6784\u6210\u4EFB\u610F\u8FDB\u5236\u8BA1\u6570\u5668\uFF08\u53CD\u9988\u6E05\u96F6\u6CD5\u6216\u7F6E\u6570\u6CD5\uFF09"
    },
    "74LS194": {
      "image": "assets/pinouts/document/74ls194-1.png",
      "logicImage": "assets/pinouts/document/74ls194-2.png",
      "summary": "4\u4F4D\u53CC\u5411\u79FB\u4F4D\u5BC4\u5B58\u5668\u3002S1S0=00\u4FDD\u6301\u300101\u53F3\u79FB\u300110\u5DE6\u79FB\u300111\u5E76\u884C\u7F6E\u6570\uFF1BSR\u4E3A\u53F3\u79FB\u4E32\u5165\u7AEF\uFF0CSL\u4E3A\u5DE6\u79FB\u4E32\u5165\u7AEF\uFF0CCLR\u2032\u4E3A\u5F02\u6B65\u6E05\u96F6\uFF08\u4F4E\u6709\u6548\uFF09\u3002\u53EF\u6784\u6210\u73AF\u5F62\u3001\u626D\u73AF\u5F62\u8BA1\u6570\u5668\u53CA\u4E32\u5E76\u8F6C\u6362\u7535\u8DEF"
    }
  };

  // src/catalog.mjs
  var CHIP_REFERENCES = {
    "74LS273": { file: "sn74ls273", page: 1, summary: "\u5B83\u80FD\u540C\u65F6\u4FDD\u5B58\u516B\u4F4D\u6570\u636E\u3002\u6E05\u96F6\u811A\u62C9\u4F4E\u65F6\uFF0C\u5168\u90E8\u8F93\u51FA\u53D8\u4E3A 0\uFF1B\u6E05\u96F6\u811A\u4FDD\u6301\u9AD8\u7535\u5E73\u65F6\uFF0C\u65F6\u949F\u4E0A\u5347\u6CBF\u628A D \u8F93\u5165\u4FDD\u5B58\u5230 Q \u8F93\u51FA" },
    "74LS283": { file: "sn74ls283", page: 1, summary: "\u5B83\u628A\u4E24\u4E2A\u56DB\u4F4D\u6570\u4E0E\u8F93\u5165\u8FDB\u4F4D C0 \u76F8\u52A0\uFF0C\u8F93\u51FA\u56DB\u4F4D\u548C\u4EE5\u53CA\u8FDB\u4F4D C4\u3002A1\u3001B1\u3001\u03A31 \u5BF9\u5E94\u6700\u4F4E\u4F4D" },
    "74LS86": { file: "sn74ls86a", page: 1, summary: "\u5B83\u5305\u542B\u56DB\u4E2A\u72EC\u7ACB\u7684\u5F02\u6216\u95E8\u3002\u4E24\u4E2A\u8F93\u5165\u4E0D\u540C\u65F6\u8F93\u51FA 1\uFF0C\u76F8\u540C\u65F6\u8F93\u51FA 0\u3002\u539F\u5382 LS86A \u8D44\u6599\u4E2D\u7684\u8FD9\u7EC4 DIP \u5F15\u811A\u4E0E\u5B9E\u9A8C\u6750\u6599\u4E00\u81F4" },
    "74LS00": { file: "sn74ls00", page: 3, summary: "\u5B83\u5305\u542B\u56DB\u4E2A\u72EC\u7ACB\u7684\u4E0E\u975E\u95E8\u3002\u53EA\u6709\u4E24\u4E2A\u8F93\u5165\u90FD\u662F 1 \u65F6\uFF0C\u8F93\u51FA\u624D\u662F 0\u3002\u8BF7\u6309\u672C\u578B\u53F7\u7684\u811A\u540D\u63A5\u7EBF" },
    "74LS08": { file: "sn74ls08", page: 1, summary: "\u5B83\u5305\u542B\u56DB\u4E2A\u72EC\u7ACB\u7684\u4E0E\u95E8\u3002\u4E24\u4E2A\u8F93\u5165\u90FD\u662F 1 \u65F6\u8F93\u51FA 1\uFF0C\u5176\u4F59\u60C5\u51B5\u8F93\u51FA 0" },
    "74LS32": { file: "sn74ls32", page: 1, summary: "\u5B83\u5305\u542B\u56DB\u4E2A\u72EC\u7ACB\u7684\u6216\u95E8\u3002\u81F3\u5C11\u4E00\u4E2A\u8F93\u5165\u4E3A 1 \u65F6\u8F93\u51FA 1" },
    "74LS04": { file: "sn74ls04", page: 1, summary: "\u5B83\u5305\u542B\u516D\u4E2A\u72EC\u7ACB\u7684\u975E\u95E8\u3002\u8F93\u5165\u4E3A 0 \u65F6\u8F93\u51FA 1\uFF0C\u8F93\u5165\u4E3A 1 \u65F6\u8F93\u51FA 0" }
  };
  for (const model of Object.keys(DOCUMENT_REFERENCES)) {
    CHIP_REFERENCES[model] = DOCUMENT_REFERENCES[model];
  }

  // src/chip-reference-view.mjs
  function appendChipReference(container, chip) {
    const reference = CHIP_REFERENCES[chip.model];
    const figure = node("figure", "", "chip-reference");
    const imageLink = node("a", "", "");
    let imagePath = "assets/pinouts/" + reference.file + ".png";
    if (reference.image) {
      imagePath = reference.image;
    }
    imageLink.href = imagePath;
    imageLink.target = "_blank";
    imageLink.rel = "noopener";
    const image = document.createElement("img");
    image.src = imageLink.href;
    image.alt = chip.model + " DIP \u5F15\u811A\u56FE";
    imageLink.append(image);
    let caption = "\u539F\u5382\u9876\u89C6\u56FE\uFF1A\u7F3A\u53E3\u671D\u4E0A\uFF1B\u753B\u5E03\u4E2D\u7684\u82AF\u7247\u7F3A\u53E3\u671D\u5DE6";
    let sourceLabel = "TI \u6570\u636E\u624B\u518C \xB7 \u7B2C " + reference.page + " \u9875";
    if (reference.image) {
      caption = "\u7528\u6237\u6750\u6599\u4E2D\u7684\u5F15\u811A\u56FE\uFF1B\u5B89\u88C5\u65F6\u8BF7\u6309\u7269\u7406\u811A\u53F7\u6838\u5BF9";
      sourceLabel = "\u67E5\u770B\u6750\u6599\u4E2D\u7684\u903B\u8F91\u7B26\u53F7";
    }
    figure.append(imageLink, node("figcaption", caption, ""));
    const source = node("a", sourceLabel, "datasheet-link");
    source.href = "assets/datasheets/" + reference.file + ".pdf#page=" + reference.page;
    if (reference.logicImage) {
      source.href = reference.logicImage;
    }
    source.target = "_blank";
    source.rel = "noopener";
    container.append(figure, source, node("p", reference.summary, "chip-summary"));
  }

  // src/motion.mjs
  var MOTION = { duration: 180, zoomDuration: 160, toastDuration: 180 };
  var transitions = /* @__PURE__ */ new Map();
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var frame = 0;
  function easing(progress) {
    const remaining = 1 - progress;
    return 1 - remaining * remaining * remaining;
  }
  function stepTransitions(time) {
    frame = 0;
    for (const entry of transitions) {
      const key = entry[0];
      const transition = entry[1];
      const progress = Math.min(1, (time - transition.started) / transition.duration);
      const value = transition.first + (transition.last - transition.first) * easing(progress);
      transition.update(value);
      if (progress === 1) {
        transitions.delete(key);
      }
    }
    if (transitions.size > 0) {
      frame = window.requestAnimationFrame(stepTransitions);
    }
  }
  function tween(key, first, last, update, duration) {
    transitions.delete(key);
    if (reducedMotion.matches || first === last) {
      update(last);
      return;
    }
    transitions.set(key, { first, last, update, duration, started: performance.now() });
    if (frame === 0) {
      frame = window.requestAnimationFrame(stepTransitions);
    }
  }
  function fadeContent(element2) {
    if (reducedMotion.matches) {
      return;
    }
    for (const animation of element2.getAnimations()) {
      animation.cancel();
    }
    const style = getComputedStyle(document.documentElement);
    element2.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: MOTION.duration, easing: style.getPropertyValue("--ease-out").trim() });
  }

  // src/toast.mjs
  var TOAST_SETTINGS = { duration: 6e3, visibleLimit: 4 };
  var toastCounter = 0;
  function removeToast(id) {
    const item = element(id);
    if (!item) {
      return;
    }
    window.clearTimeout(Number(item.dataset.timer));
    item.classList.add("leaving");
    window.setTimeout(detachToast.bind(null, id), MOTION.toastDuration);
  }
  function detachToast(id) {
    const item = element(id);
    if (item) {
      item.remove();
    }
  }
  function closeToast(event) {
    const item = event.currentTarget.closest(".toast");
    removeToast(item.id);
  }
  function pauseToast(event) {
    window.clearTimeout(Number(event.currentTarget.dataset.timer));
  }
  function resumeToast(event) {
    const item = event.currentTarget;
    const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer);
  }
  function showToast(message, kind) {
    toastCounter = toastCounter + 1;
    const item = node("div", "", "toast " + kind);
    item.id = "toast-" + toastCounter;
    item.setAttribute("role", "status");
    let symbol = "circle-alert";
    if (kind === "info") {
      symbol = "info";
    } else if (kind === "warning") {
      symbol = "triangle-alert";
    }
    item.append(icon(symbol), node("span", message, ""));
    const close = node("button", "", "icon-button");
    close.setAttribute("aria-label", "\u5173\u95ED\u63D0\u793A");
    close.append(icon("x"));
    close.addEventListener("click", closeToast);
    item.append(close);
    item.addEventListener("mouseenter", pauseToast);
    item.addEventListener("mouseleave", resumeToast);
    item.addEventListener("focusin", pauseToast);
    item.addEventListener("focusout", resumeToast);
    const region = element("toast-region");
    region.append(item);
    const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer);
    while (region.children.length > TOAST_SETTINGS.visibleLimit) {
      const oldest = region.firstElementChild;
      window.clearTimeout(Number(oldest.dataset.timer));
      oldest.remove();
    }
    refreshIcons();
  }

  // vendor/logic.mjs
  var _Display3vlWithRegex_regex;
  function zip(f, a, b) {
    return a.map((x2, i) => f(x2, b[i]));
  }
  function zip4(f, a, b, c, d) {
    return a.map((x2, i) => f(x2, b[i], c[i], d[i]));
  }
  function bitfold(f, a, lastmask, neutral) {
    if (a.length == 0)
      return neutral == 1 ? 1 : 0;
    let acc = a[a.length - 1];
    if (neutral == 1)
      acc |= ~lastmask;
    else
      acc &= lastmask;
    for (let i = 0; i < a.length - 1; i++)
      acc = f(acc, a[i]);
    acc = f(acc, acc >>> 16);
    acc = f(acc, acc >>> 8);
    acc = f(acc, acc >>> 4);
    acc = f(acc, acc >>> 2);
    acc = f(acc, acc >>> 1);
    return acc & 1;
  }
  function wordnum(n) {
    return n >> 5;
  }
  function bitnum(n) {
    return n & 31;
  }
  function fillRest(m, k, words, avec, bvec) {
    const last_x = m > 0 && !(avec[k] & 1 << m - 1) && bvec[k] & 1 << m - 1;
    if (last_x && bitnum(m))
      bvec[k] |= -1 << m;
    if (last_x && k + 1 < words) {
      bvec.fill(-1, k + 1);
    }
  }
  function makeMap(bits, depth) {
    const ret = {};
    function g(what, val) {
      ret[what] = val;
      if (what.length * bits >= depth)
        return;
      for (let i = 0; i < 1 << bits; i += 1)
        g(what + i.toString(1 << bits), val << bits | i | i << 16);
      g(what + "x", val << bits | (1 << bits) - 1);
    }
    g("", 0);
    Object.seal(ret);
    return ret;
  }
  var fromBinMap = makeMap(1, 8);
  var fromOctMap = makeMap(3, 3);
  var fromHexMap = makeMap(4, 8);
  function toHexInternal(start2, bits, avec, bvec) {
    const out = [];
    let bit = 0, k = start2;
    while (bit < bits) {
      const a = "00000000" + avec[k].toString(16);
      const x2 = avec[k] ^ bvec[k];
      k++;
      for (let b = 0; b < 8 && bit < bits; b++, bit += 4) {
        if (x2 & 15 << 4 * b)
          out.push("x");
        else
          out.push(a[a.length - 1 - b]);
      }
    }
    return out.reverse().join("");
  }
  function toBinInternal(start2, bits, avec, bvec) {
    const out = [];
    let bit = 0, k = start2;
    while (bit < bits) {
      const a = "00000000000000000000000000000000" + avec[k].toString(2);
      const x2 = avec[k] ^ bvec[k];
      k++;
      for (let b = 0; b < 32 && bit < bits; b++, bit++) {
        if (x2 & 1 << b)
          out.push("x");
        else
          out.push(a[a.length - 1 - b]);
      }
    }
    return out.reverse().join("");
  }
  function fromHexInternal(data, start2, nbits, avec, bvec) {
    const skip = 4;
    const words = nbits + 31 >>> 5;
    let m = 0, k = -1 + start2;
    for (let i = data.length; i > 0; ) {
      const frag = data.slice(Math.max(0, i - 2), i);
      i -= frag.length;
      const v = fromHexMap[frag];
      if (bitnum(m) == 0)
        k++;
      const mask = (1 << skip * frag.length) - 1;
      avec[k] |= (v >>> 16 & mask) << m;
      bvec[k] |= (v & mask) << m;
      m += skip * frag.length;
    }
    if (m < nbits)
      fillRest(m, k, words, avec, bvec);
  }
  function fromBinInternal(data, start2, nbits, avec, bvec) {
    const skip = 1;
    const words = nbits + 31 >>> 5;
    let m = 0, k = -1 + start2;
    for (let i = data.length; i > 0; ) {
      const frag = data.slice(Math.max(0, i - 8), i);
      i -= frag.length;
      const v = fromBinMap[frag];
      if (bitnum(m) == 0)
        k++;
      const mask = (1 << skip * frag.length) - 1;
      avec[k] |= (v >>> 16 & mask) << m;
      bvec[k] |= (v & mask) << m;
      m += skip * frag.length;
    }
    if (m < nbits)
      fillRest(m, k, words, avec, bvec);
  }
  var Error3vl = class _Error3vl extends Error {
    constructor(s) {
      super(s);
      Object.setPrototypeOf(this, _Error3vl.prototype);
    }
  };
  function assert(c, s) {
    if (!c)
      throw new Error3vl("Assertion failed: " + s);
  }
  var Vector3vl = class _Vector3vl {
    /**
     * Private constructor for three-value logic vectors.
     *
     * **Only for internal use.**
     *
     * @param bits Number of bits in the vector.
     * @param avec Bit vector A.
     * @param bvec Bit vector B.
     */
    constructor(bits, avec, bvec) {
      this._bits = bits;
      this._avec = avec;
      this._bvec = bvec;
    }
    /**
     * Construct a vector with a constant value at each position.
     *
     * @param bits Number of bits in the vector.
     * @param init Initializer. Recognized values:
     * * false, -1, '0' for logical 0,
     * * 0, 'x' for undefined value,
     * * true, 1, '1' for logical 1.
     */
    static make(bits, init) {
      bits = bits | 0;
      let iva, ivb;
      switch (init) {
        case true:
        case "1":
        case 1:
          iva = ivb = ~0;
          break;
        case false:
        case "0":
        case -1:
        case void 0:
          iva = ivb = 0;
          break;
        case "x":
        case 0:
          iva = 0;
          ivb = ~0;
          break;
        default:
          assert(false, "Vector3vl.make() called with invalid initializer");
      }
      const words = (bits + 31) / 32 | 0;
      return new _Vector3vl(bits, new Uint32Array(words).fill(iva), new Uint32Array(words).fill(ivb));
    }
    /**
     * Construct a vector containing only zeros.
     *
     * @param bits Number of bits in the vector.
     */
    static zeros(bits) {
      return _Vector3vl.make(bits, -1);
    }
    /**
     * Construct a vector containing only ones.
     *
     * @param bits Number of bits in the vector.
     */
    static ones(bits) {
      return _Vector3vl.make(bits, 1);
    }
    /**
     * Construct a vector containing only undefined values.
     *
     * @param bits Number of bits in the vector.
     */
    static xes(bits) {
      return _Vector3vl.make(bits, 0);
    }
    /**
     * Construct a vector containing Boolean value _b_.
     *
     * @param b Boolean value for the vector.
     * @param bits Number of bits in the vector.
     */
    static fromBool(b, bits = 1) {
      return _Vector3vl.make(bits, b ? 1 : -1);
    }
    /**
     * Concatenate vectors into a single big vector.
     *
     * @param vs Vectors to concatenate.
     *           Arguments are ordered least significant bit first.
     */
    static concat(...vs) {
      const sumbits = vs.reduce((y2, x2) => x2.bits + y2, 0);
      const words = sumbits + 31 >>> 5;
      let bits = 0, idx = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      for (const v of vs) {
        v.normalize();
        if (bitnum(bits) == 0) {
          avec.set(v._avec, idx + 1);
          bvec.set(v._bvec, idx + 1);
          bits += v._bits;
          idx += v._bits + 31 >>> 5;
        } else {
          for (const k in v._avec) {
            avec[idx] |= v._avec[k] << bits;
            bvec[idx] |= v._bvec[k] << bits;
            idx++;
            if (idx == words)
              break;
            avec[idx] = v._avec[k] >>> -bits;
            bvec[idx] = v._bvec[k] >>> -bits;
          }
          bits += v._bits;
          if (idx + 1 > bits + 31 >>> 5) {
            idx--;
          }
        }
      }
      return new _Vector3vl(bits, avec, bvec);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function calls [[fromIteratorAnySkip]] or [[fromIteratorPow2]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step. 1 to 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIterator(iter, skip, nbits) {
      if ((skip & skip - 1) == 0)
        return _Vector3vl.fromIteratorPow2(iter, skip, nbits);
      else
        return _Vector3vl.fromIteratorAnySkip(iter, skip, nbits);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function is more generic, but slower, than [[fromIteratorPow2]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step. 1 to 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIteratorAnySkip(iter, skip, nbits) {
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (const v of iter) {
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> skip & mask) << m;
        bvec[k] |= (v & mask) << m;
        if (mask << m >>> m != mask) {
          k++;
          avec[k] = (v >>> skip & mask) >>> -m;
          bvec[k] = (v & mask) >>> -m;
        }
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function is limited to power of 2 _skip_ values.
     * For generic version, see [[fromIteratorAnySkip]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step.
     *             Limited to powers of 2: 1, 2, 4, 8, 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIteratorPow2(iter, skip, nbits) {
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (const v of iter) {
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> skip & mask) << m;
        bvec[k] |= (v & mask) << m;
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an array of numbers.
     *
     * The following interpretation is used:
     * * -1 for logical 0,
     * * 0 for undefined value,
     * * 1 for logical 1.
     *
     * @param data Input array.
     */
    static fromArray(data) {
      const nbits = data.length;
      const skip = 1;
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (const x2 of data) {
        const v = x2 + 1 + Number(x2 > 0);
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> skip & mask) << m;
        bvec[k] |= (v & mask) << m;
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a binary string.
     *
     * Three characters are accepted:
     * * '0' for logical 0,
     * * 'x' for undefined value,
     * * '1' for logical 1.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The binary string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_.
     */
    static fromBin(data, nbits) {
      if (nbits === void 0)
        nbits = data.length;
      const words = nbits + 31 >>> 5;
      const avec = new Uint32Array(words), bvec = new Uint32Array(words);
      fromBinInternal(data, 0, nbits, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an octal number.
     *
     * Characters '0' to '7' and 'x' are accepted. The character 'x'
     * means three undefined bits.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The octal string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_
     *              times three.
     */
    static fromOct(data, nbits) {
      const skip = 3;
      if (nbits === void 0)
        nbits = data.length * skip;
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (let i = data.length - 1; i >= 0; i--) {
        const v = fromOctMap[data[i]];
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> 16 & mask) << m;
        bvec[k] |= (v & mask) << m;
        if (mask << m >>> m != mask) {
          k++;
          avec[k] = (v >>> 16 & mask) >>> -m;
          bvec[k] = (v & mask) >>> -m;
        }
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a hexadecimal number.
     *
     * Characters '0' to '9', 'a' to 'f' and 'x' are accepted. The character
     * 'x' means three undefined bits.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The hexadecimal string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_
     *              times four.
     */
    static fromHex(data, nbits) {
      if (nbits === void 0)
        nbits = data.length * 4;
      const words = nbits + 31 >>> 5;
      const avec = new Uint32Array(words), bvec = new Uint32Array(words);
      fromHexInternal(data, 0, nbits, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a Verilog-like string.
     */
    static fromString(data) {
      const re2 = /^([0-9]*)'?(b[01x]*|o[0-7x]*|h[0-9a-fx]*|d[0-9]*)$/;
      const res = re2.exec(data);
      assert(res != null, "Vector3vl.fromString() Invalid string");
      const bits = res[1].length ? Number(res[1]) : void 0;
      const num = res[2].slice(1);
      switch (res[2][0]) {
        case "b":
          return _Vector3vl.fromBin(num, bits);
        case "o":
          return _Vector3vl.fromOct(num, bits);
        case "h":
          return _Vector3vl.fromHex(num, bits);
        case "d":
          return _Vector3vl.fromNumber(BigInt(num), bits);
      }
    }
    /**
     * Construct a vector from clonable representation.
     *
     * @param data The initialization value.
     */
    static fromClonable(data) {
      return new _Vector3vl(data._bits, data._avec, data._bvec);
    }
    /**
     * Construct a vector from a number or a bigint.
     *
     * If _nbits_ bits are not enough to represent the number, it is
     * truncated. If it's larger, the number is sign-extended.
     * If it is not given, the resulting vector will have enough bits
     * to represent the number completely.
     *
     * @param data The initialization value.
     * @param nbits Number of bits in the vector.
     */
    static fromNumber(data, nbits) {
      const fbits = nbits === void 0 ? 0 : nbits;
      const bdata = BigInt(data);
      if (bdata >= BigInt(0)) {
        let b = bdata.toString(2);
        return _Vector3vl.fromBin("0".repeat(Math.max(0, fbits - b.length)) + b, nbits);
      } else {
        const c = (-bdata).toString(2).length;
        const j2 = bdata + (BigInt(1) << BigInt(c));
        let b = j2.toString(2);
        return _Vector3vl.fromBin("1".repeat(Math.max(1, fbits - c)) + "0".repeat(c - b.length) + b, nbits);
      }
    }
    /**
     * Number of bits in the vector.
     */
    get bits() {
      return this._bits;
    }
    /**
     * Most significant bit in the vector. Returns -1, 0 or 1.
     */
    get msb() {
      return this.get(this._bits - 1);
    }
    /**
     * Least significant bit in the vector. Returns -1, 0 or 1.
     */
    get lsb() {
      return this.get(0);
    }
    /**
     * Gets _n_th value in the vector. Returns -1, 0 or 1.
     */
    get(n) {
      const bn = bitnum(n);
      const wn = wordnum(n);
      const a = this._avec[wn] >>> bn & 1;
      const b = this._bvec[wn] >>> bn & 1;
      return a + b - 1;
    }
    /**
     * Tests if the vector is all ones.
     */
    get isHigh() {
      if (this._bits == 0)
        return true;
      const lastmask = this._lastmask;
      const vechigh = (vec) => vec.slice(0, vec.length - 1).every((x2) => ~x2 == 0) && (vec[vec.length - 1] & lastmask) == lastmask;
      return vechigh(this._avec) && vechigh(this._bvec);
    }
    /**
     * Tests if the vector is all zeros.
     */
    get isLow() {
      if (this._bits == 0)
        return true;
      const lastmask = this._lastmask;
      const veclow = (vec) => vec.slice(0, vec.length - 1).every((x2) => x2 == 0) && (vec[vec.length - 1] & lastmask) == 0;
      return veclow(this._avec) && veclow(this._bvec);
    }
    /**
     * Tests if there is any defined bit in the vector.
     */
    get isDefined() {
      if (this._bits == 0)
        return false;
      const dvec = zip((a, b) => a ^ b, this._avec, this._bvec);
      dvec[dvec.length - 1] |= ~this._lastmask;
      return !dvec.every((x2) => ~x2 == 0);
    }
    /**
     * Tests if every bit in the vector is defined.
     */
    get isFullyDefined() {
      if (this._bits == 0)
        return true;
      const dvec = zip((a, b) => a ^ b, this._avec, this._bvec);
      dvec[dvec.length - 1] &= this._lastmask;
      return !dvec.some((x2) => Boolean(x2));
    }
    /**
     * Bitwise AND of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    and(v) {
      assert(v._bits == this._bits, "Vector3vl.and() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => a & b, v._avec, this._avec), zip((a, b) => a & b, v._bvec, this._bvec));
    }
    /**
     * Bitwise OR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    or(v) {
      assert(v._bits == this._bits, "Vector3vl.or() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => a | b, v._avec, this._avec), zip((a, b) => a | b, v._bvec, this._bvec));
    }
    /**
     * Bitwise XOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    xor(v) {
      assert(v._bits == this._bits, "Vector3vl.xor() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip4((a1, a2, b1, b2) => (a1 | b1) & (a2 ^ b2), v._avec, v._bvec, this._avec, this._bvec), zip4((a1, a2, b1, b2) => a1 & b1 ^ (a2 | b2), v._avec, v._bvec, this._avec, this._bvec));
    }
    /**
     * Bitwise NAND of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    nand(v) {
      assert(v._bits == this._bits, "Vector3vl.nand() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => ~(a & b), v._bvec, this._bvec), zip((a, b) => ~(a & b), v._avec, this._avec));
    }
    /**
     * Bitwise NOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    nor(v) {
      assert(v._bits == this._bits, "Vector3vl.nor() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => ~(a | b), v._bvec, this._bvec), zip((a, b) => ~(a | b), v._avec, this._avec));
    }
    /**
     * Bitwise XNOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    xnor(v) {
      assert(v._bits == this._bits, "Vector3vl.xnor() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip4((a1, a2, b1, b2) => ~(a1 & b1 ^ (a2 | b2)), v._avec, v._bvec, this._avec, this._bvec), zip4((a1, a2, b1, b2) => ~((a1 | b1) & (a2 ^ b2)), v._avec, v._bvec, this._avec, this._bvec));
    }
    /**
     * Bitwise NOT of a vector. */
    not() {
      return new _Vector3vl(this._bits, this._bvec.map((a) => ~a), this._avec.map((a) => ~a));
    }
    /**
     * Return a vector with 1 on locations with x, the rest with 0.
     */
    xmask() {
      const v = zip((a, b) => a ^ b, this._avec, this._bvec);
      return new _Vector3vl(this._bits, v, v);
    }
    /**
     * Reducing AND of a vector.
     *
     * ANDs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceAnd() {
      return new _Vector3vl(1, Uint32Array.of(bitfold((a, b) => a & b, this._avec, this._lastmask, 1)), Uint32Array.of(bitfold((a, b) => a & b, this._bvec, this._lastmask, 1)));
    }
    /**
     * Reducing OR of a vector.
     *
     * ORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceOr() {
      return new _Vector3vl(1, Uint32Array.of(bitfold((a, b) => a | b, this._avec, this._lastmask, 0)), Uint32Array.of(bitfold((a, b) => a | b, this._bvec, this._lastmask, 0)));
    }
    /**
     * Reducing NAND of a vector.
     *
     * NANDs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceNand() {
      return new _Vector3vl(1, Uint32Array.of(~bitfold((a, b) => a & b, this._bvec, this._lastmask, 1)), Uint32Array.of(~bitfold((a, b) => a & b, this._avec, this._lastmask, 1)));
    }
    /**
     * Reducing NOR of a vector.
     *
     * NORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceNor() {
      return new _Vector3vl(1, Uint32Array.of(~bitfold((a, b) => a | b, this._bvec, this._lastmask, 0)), Uint32Array.of(~bitfold((a, b) => a | b, this._avec, this._lastmask, 0)));
    }
    /**
     * Reducing XOR of a vector.
     *
     * XORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceXor() {
      const xes = zip((a, b) => ~a & b, this._avec, this._bvec);
      const has_x = bitfold((a, b) => a | b, xes, this._lastmask, 0);
      const v = bitfold((a, b) => a ^ b, this._avec, this._lastmask, 0);
      return new _Vector3vl(1, Uint32Array.of(v & ~has_x), Uint32Array.of(v | has_x));
    }
    /**
     * Reducing XNOR of a vector.
     *
     * XNORs all bits of the vector together, producing a single bit.
     *
     * @return Singleton vector.
     */
    reduceXnor() {
      return this.reduceXor().not();
    }
    /**
     * Concatenates vectors, including this one, into a single vector.
     *
     * @param vs The other vectors.
     */
    concat(...vs) {
      return _Vector3vl.concat(this, ...vs);
    }
    /**
     * Return a subvector.
     *
     * Uses same conventions as the slice function for JS arrays.
     *
     * @param start Number of the first bit to include in the result.
     *              If omitted, first bit of the vector is used.
     * @param end Number of the last bit to include in the result, plus one.
     *            If omitted, last bit of the vector is used.
     */
    slice(start2, end) {
      if (start2 === void 0)
        start2 = 0;
      if (end === void 0)
        end = this._bits;
      if (end > this.bits)
        end = this.bits;
      if (start2 > end)
        end = start2;
      if (bitnum(start2) == 0) {
        const avec = this._avec.slice(start2 >>> 5, end + 31 >>> 5);
        const bvec = this._bvec.slice(start2 >>> 5, end + 31 >>> 5);
        return new _Vector3vl(end - start2, avec, bvec);
      } else {
        const words = end - start2 + 31 >>> 5;
        const avec = new Uint32Array(words), bvec = new Uint32Array(words);
        let k = 0;
        avec[k] = this._avec[start2 >> 5] >>> start2;
        bvec[k] = this._bvec[start2 >> 5] >>> start2;
        for (let idx = (start2 >> 5) + 1; idx <= end >>> 5; idx++) {
          avec[k] |= this._avec[idx] << -start2;
          bvec[k] |= this._bvec[idx] << -start2;
          k++;
          if (k == words)
            break;
          avec[k] = this._avec[idx] >>> start2;
          bvec[k] = this._bvec[idx] >>> start2;
        }
        return new _Vector3vl(end - start2, avec, bvec);
      }
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * This function calls [[toIteratorAnySkip]] or [[toIteratorPow2]].
     *
     * @param skip Number of bits in a single iterator step. 1 to 16.
     */
    toIterator(skip) {
      if ((skip & skip - 1) == 0)
        return this.toIteratorPow2(skip);
      else
        return this.toIteratorAnySkip(skip);
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * @param skip Number of bits in a single iterator step. 1 to 16.
     */
    *toIteratorAnySkip(skip) {
      this.normalize();
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        let a = (this._avec[k] & m) >>> bit;
        let b = (this._bvec[k] & m) >>> bit;
        if (m >>> bit != sm && k + 1 != this._avec.length) {
          const m1 = sm >> -bit;
          a |= (this._avec[k + 1] & m1) << -bit;
          b |= (this._bvec[k + 1] & m1) << -bit;
        }
        yield a << skip | b;
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm << bit;
        }
      }
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * @param skip Number of bits in a single iterator step. 1, 2, 4, 8 or 16.
     */
    *toIteratorPow2(skip) {
      this.normalize();
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        const a = (this._avec[k] & m) >>> bit;
        const b = (this._bvec[k] & m) >>> bit;
        yield a << skip | b;
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm;
        }
      }
    }
    /** Returns an array representation of the vector.
     *
     * The resulting array contains values -1, 0, 1.
     */
    toArray() {
      this.normalize();
      const skip = 1;
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        const a = (this._avec[k] & m) >>> bit;
        const b = (this._bvec[k] & m) >>> bit;
        const v = a << skip | b;
        out.push(v - 1 - Number(v > 1));
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm;
        }
      }
      return out;
    }
    /** Returns a binary representation of the vector.
     *
     * Three characters are used:
     * * '0' for logical 0,
     * * 'x' for undefined value,
     * * '1' for logical 1.
     */
    toBin() {
      return toBinInternal(0, this._bits, this._avec, this._bvec);
    }
    /** Returns an octal representation of the vector.
     *
     * Returned characters can be '0' to '7' and 'x'. An 'x' value is returned
     * if any of the three bits is undefined.
     */
    toOct() {
      this.normalize();
      const skip = 3;
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        let a = (this._avec[k] & m) >>> bit;
        let b = (this._bvec[k] & m) >>> bit;
        if (m >>> bit != sm && k + 1 != this._avec.length) {
          const m1 = sm >> -bit;
          a |= (this._avec[k + 1] & m1) << -bit;
          b |= (this._bvec[k + 1] & m1) << -bit;
        }
        const v = a << skip | b;
        if (7 & v & ~(v >> 3))
          out.push("x");
        else
          out.push((v >> 3).toString());
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm << bit;
        }
      }
      return out.reverse().join("");
    }
    /** Returns an hexadecimal representation of the vector.
     *
     * Returned characters can be '0' to '9', 'a' to 'f' and 'x'. An 'x' value
     * is returned if any of the four bits is undefined.
     */
    toHex() {
      this.normalize();
      return toHexInternal(0, this._bits, this._avec, this._bvec);
    }
    /** Returns a string describing the vector. */
    toString() {
      return "Vector3vl " + this.toBin();
    }
    /** Returns an object which can be copied by structured clone. */
    toClonable() {
      return { _bits: this._bits, _avec: this._avec, _bvec: this._bvec };
    }
    /** Returns a number representing the vector. */
    toNumber(signed = false) {
      if (signed)
        return this.toNumberSigned();
      assert(this.isFullyDefined, "Vector3vl.toNumber() called on a not fully defined vector");
      assert(this._bits < 32, "Vector3vl.toNumber() called on a too wide vector");
      if (this._bits == 0)
        return 0;
      else
        return Number.parseInt(this.toHex(), 16);
    }
    /** Return a signed number representing the vector. */
    toNumberSigned() {
      assert(this.isFullyDefined, "Vector3vl.toNumberSigned() called on a not fully defined vector");
      assert(this._bits < 32, "Vector3vl.toNumberSigned() called on a too wide vector");
      assert(this._bits > 0, "Vector3vl.toNumberSigned() called on an empty vector");
      const sign = this.msb == 1;
      return sign ? Number.parseInt(this.toHex(), 16) - (1 << this._bits) : Number.parseInt(this.toHex(), 16);
    }
    /** Returns a BigInt representing the vector. */
    toBigInt(signed = false) {
      if (signed)
        return this.toBigIntSigned();
      assert(this.isFullyDefined, "Vector3vl.toBigInt() called on a not fully defined vector");
      if (this._bits == 0)
        return BigInt(0);
      else
        return BigInt("0x" + this.toHex());
    }
    /** Return a signed BigInt representing the vector. */
    toBigIntSigned() {
      assert(this.isFullyDefined, "Vector3vl.toBigIntSigned() called on a not fully defined vector");
      assert(this._bits > 0, "Vector3vl.toBigIntSigned() called on an empty vector");
      const sign = this.msb == 1;
      return sign ? BigInt("0x" + this.toHex()) - (BigInt(1) << BigInt(this._bits)) : BigInt("0x" + this.toHex());
    }
    /** Compares two vectors for equality. */
    eq(v) {
      if (v._bits != this._bits)
        return false;
      this.normalize();
      v.normalize();
      for (const i in this._avec) {
        if (this._avec[i] != v._avec[i])
          return false;
        if (this._bvec[i] != v._bvec[i])
          return false;
      }
      return true;
    }
    /** Normalize the vector.
     *
     * Because of the representation used, if _bits_ is not a multiple
     * of 32, some internal bits do not contribute to the vector value,
     * and for performance reasons can get arbitrary values in the course
     * of computations. This procedure clears these bits.
     * For internal use.
     */
    normalize() {
      const lastmask = this._lastmask;
      this._avec[this._avec.length - 1] &= lastmask;
      this._bvec[this._bvec.length - 1] &= lastmask;
    }
    /** Mask for unused bits.
     *
     * For internal use.
     */
    get _lastmask() {
      return ~0 >>> -this.bits;
    }
  };
  Vector3vl.empty = Vector3vl.zeros(0);
  Vector3vl.one = Vector3vl.ones(1);
  Vector3vl.zero = Vector3vl.zeros(1);
  Vector3vl.x = Vector3vl.xes(1);
  _Display3vlWithRegex_regex = /* @__PURE__ */ new WeakMap();

  // src/extra-chips.mjs
  var EXTRA_CHIPS = {
    "74LS03": {
      title: "\u56DB\u8DEFOC\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      kind: "open-collector",
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]]
    },
    "74LS20": {
      title: "\u53CC\u56DB\u8F93\u5165\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "NC", "2A", "2B", "1Y", "GND", "2Y", "2C", "2D", "NC", "1C", "1D", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [6, 8],
      kind: "nand4",
      gates: [[1, 2, 12, 13, 6], [4, 5, 9, 10, 8]]
    },
    "CD4011": {
      title: "\u56DB\u8DEFCMOS\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2Y", "2A", "2B", "VSS", "3A", "3B", "3Y", "4Y", "4A", "4B", "VDD"],
      inputs: [1, 2, 5, 6, 8, 9, 12, 13],
      outputs: [3, 4, 10, 11],
      kind: "cmos-nand",
      gates: [[1, 2, 3], [5, 6, 4], [8, 9, 10], [12, 13, 11]]
    },
    "74LS125": {
      title: "\u56DB\u8DEF\u4E09\u6001\u7F13\u51B2\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1G\u2032", "1A", "1Y", "2G\u2032", "2A", "2Y", "GND", "3Y", "3A", "3G\u2032", "4Y", "4A", "4G\u2032", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      kind: "tristate",
      gates: [[1, 2, 3], [4, 5, 6], [10, 9, 8], [13, 12, 11]]
    },
    "74LS138": {
      title: "\u4E09\u7EBF\u516B\u7EBF\u8BD1\u7801\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "A0", "A1", "A2", "S3\u2032(G2A\u2032)", "S2\u2032(G2B\u2032)", "S1(G1)", "Y7\u2032", "GND", "Y6\u2032", "Y5\u2032", "Y4\u2032", "Y3\u2032", "Y2\u2032", "Y1\u2032", "Y0\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6],
      outputs: [15, 14, 13, 12, 11, 10, 9, 7],
      kind: "decoder8"
    },
    "74LS139": {
      title: "\u53CC\u4E8C\u7EBF\u56DB\u7EBF\u8BD1\u7801\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "1G\u2032", "1A", "1B", "1Y0\u2032", "1Y1\u2032", "1Y2\u2032", "1Y3\u2032", "GND", "2Y3\u2032", "2Y2\u2032", "2Y1\u2032", "2Y0\u2032", "2B", "2A", "2G\u2032", "VCC"],
      inputs: [1, 2, 3, 13, 14, 15],
      outputs: [4, 5, 6, 7, 12, 11, 10, 9],
      kind: "dual-decoder"
    },
    "74LS151": {
      title: "\u516B\u9009\u4E00\u6570\u636E\u9009\u62E9\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "D3", "D2", "D1", "D0", "Y", "W\u2032(Y\u2032)", "G\u2032", "GND", "C", "B", "A", "D7", "D6", "D5", "D4", "VCC"],
      inputs: [1, 2, 3, 4, 7, 9, 10, 11, 12, 13, 14, 15],
      outputs: [5, 6],
      kind: "mux8"
    },
    "74LS153": {
      title: "\u53CC\u56DB\u9009\u4E00\u6570\u636E\u9009\u62E9\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "1G\u2032", "B", "1C3", "1C2", "1C1", "1C0", "1Y", "GND", "2Y", "2C0", "2C1", "2C2", "2C3", "A", "2G\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15],
      outputs: [7, 9],
      kind: "dual-mux"
    },
    "74LS85": {
      title: "\u56DB\u4F4D\u6570\u503C\u6BD4\u8F83\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "B3", "A<B\u8F93\u5165", "A=B\u8F93\u5165", "A>B\u8F93\u5165", "A>B", "A=B", "A<B", "GND", "B0", "A0", "B1", "A1", "B2", "A2", "A3", "VCC"],
      inputs: [1, 2, 3, 4, 9, 10, 11, 12, 13, 14, 15],
      outputs: [5, 6, 7],
      kind: "comparator"
    },
    "74LS48": {
      title: "BCD\u4E03\u6BB5\u8BD1\u7801\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "B", "C", "LT\u2032", "BI\u2032/RBO\u2032", "RBI\u2032", "D", "A", "GND", "e", "d", "c", "b", "a", "g", "f", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7],
      outputs: [13, 12, 11, 10, 9, 15, 14, 4],
      bidirectional: [4],
      kind: "seven-segment"
    },
    "74LS74": {
      title: "\u53CCD\u89E6\u53D1\u5668",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1RD\u2032", "1D", "1CP", "1SD\u2032", "1Q", "1Q\u2032", "GND", "2Q\u2032", "2Q", "2SD\u2032", "2CP", "2D", "2RD\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 10, 11, 12, 13],
      outputs: [5, 6, 9, 8],
      sequential: "flipflop",
      edge: "rising",
      channels: [
        { reset: 1, set: 4, clock: 3, data: 2, output: 5, inverted: 6 },
        { reset: 13, set: 10, clock: 11, data: 12, output: 9, inverted: 8 }
      ]
    },
    "74LS112": {
      title: "\u53CCJK\u4E0B\u964D\u6CBF\u89E6\u53D1\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "1CP", "1K", "1J", "1SD\u2032", "1Q", "1Q\u2032", "2Q", "GND", "2Q\u2032", "2SD\u2032", "2J", "2K", "2CP", "2RD\u2032", "1RD\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 10, 11, 12, 13, 14, 15],
      outputs: [5, 6, 7, 9],
      sequential: "flipflop",
      edge: "falling",
      channels: [
        { reset: 15, set: 4, clock: 1, first: 3, second: 2, output: 5, inverted: 6 },
        { reset: 14, set: 10, clock: 13, first: 11, second: 12, output: 7, inverted: 9 }
      ]
    },
    "CD4027": {
      title: "\u53CCJK\u4E0A\u5347\u6CBF\u89E6\u53D1\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "Q2", "Q2\u2032", "CLK2", "RESET2", "K2", "J2", "SET2", "VSS", "SET1", "J1", "K1", "RESET1", "CLK1", "Q1\u2032", "Q1", "VDD"],
      inputs: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13],
      outputs: [15, 14, 1, 2],
      sequential: "flipflop",
      edge: "rising",
      activeHigh: true,
      channels: [
        { reset: 12, set: 9, clock: 13, first: 10, second: 11, output: 15, inverted: 14 },
        { reset: 4, set: 7, clock: 3, first: 6, second: 5, output: 1, inverted: 2 }
      ]
    },
    "74LS160": {
      title: "\u540C\u6B65\u5341\u8FDB\u5236\u8BA1\u6570\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "CLR\u2032", "CP", "D0", "D1", "D2", "D3", "ENP", "GND", "LOAD\u2032", "ENT", "Q3", "Q2", "Q1", "Q0", "RCO", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 9, 10],
      outputs: [14, 13, 12, 11, 15],
      sequential: "counter",
      modulus: 10
    },
    "74LS161": {
      title: "\u540C\u6B65\u4E8C\u8FDB\u5236\u8BA1\u6570\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "CLR\u2032", "CP", "D0", "D1", "D2", "D3", "ENP", "GND", "LOAD\u2032", "ENT", "Q3", "Q2", "Q1", "Q0", "RCO", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 9, 10],
      outputs: [14, 13, 12, 11, 15],
      sequential: "counter",
      modulus: 16
    },
    "74LS194": {
      title: "\u56DB\u4F4D\u53CC\u5411\u79FB\u4F4D\u5BC4\u5B58\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "CLR\u2032", "CP", "SR", "A", "B", "C", "D", "GND", "S0", "S1", "SL", "QA", "QB", "QC", "QD", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11],
      outputs: [12, 13, 14, 15],
      sequential: "shift"
    }
  };

  // src/chips.mjs
  var CHIP_MODELS = {
    "74LS273": {
      title: "\u516B\u4F4D\u5BC4\u5B58\u5668",
      count: 20,
      power: 20,
      ground: 10,
      labels: ["", "CLR\u0305", "Q0", "D0", "D1", "Q1", "Q2", "D2", "D3", "Q3", "GND", "CLK", "Q4", "D4", "D5", "Q5", "Q6", "D6", "D7", "Q7", "VCC"],
      inputs: [1, 3, 4, 7, 8, 11, 13, 14, 17, 18],
      outputs: [2, 5, 6, 9, 12, 15, 16, 19],
      data: [3, 4, 7, 8, 13, 14, 17, 18]
    },
    "74LS283": {
      title: "\u56DB\u4F4D\u5168\u52A0\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "\u03A32", "B2", "A2", "\u03A31", "A1", "B1", "C0", "GND", "C4", "\u03A34", "B4", "A4", "\u03A33", "A3", "B3", "VCC"],
      inputs: [2, 3, 5, 6, 7, 11, 12, 14, 15],
      outputs: [4, 1, 13, 10, 9],
      first: [5, 3, 14, 12],
      second: [6, 2, 15, 11]
    },
    "74LS86": {
      title: "\u56DB\u8DEF\u5F02\u6216\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "xor"
    },
    "74LS00": {
      title: "\u56DB\u8DEF\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3B", "3A", "4Y", "4B", "4A", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "nand"
    },
    "74LS08": {
      title: "\u56DB\u8DEF\u4E0E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "and"
    },
    "74LS32": {
      title: "\u56DB\u8DEF\u6216\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "or"
    },
    "74LS04": {
      title: "\u516D\u8DEF\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1Y", "2A", "2Y", "3A", "3Y", "GND", "4Y", "4A", "5Y", "5A", "6Y", "6A", "VCC"],
      inputs: [1, 3, 5, 9, 11, 13],
      outputs: [2, 4, 6, 8, 10, 12],
      gates: [[1, 1, 2], [3, 3, 4], [5, 5, 6], [9, 9, 8], [11, 11, 10], [13, 13, 12]],
      operation: "not"
    }
  };
  for (const name of Object.keys(EXTRA_CHIPS)) {
    CHIP_MODELS[name] = EXTRA_CHIPS[name];
  }
  function toVector(value) {
    if (value === 0) {
      return Vector3vl.zero;
    }
    if (value === 1) {
      return Vector3vl.one;
    }
    return Vector3vl.x;
  }
  function logicGate(operation, first, second) {
    const left = toVector(first);
    const right = toVector(second);
    let result = Vector3vl.x;
    if (operation === "xor") {
      result = left.xor(right);
    } else if (operation === "and") {
      result = left.and(right);
    } else if (operation === "or") {
      result = left.or(right);
    } else if (operation === "nand") {
      result = left.nand(right);
    } else if (operation === "not") {
      result = left.not();
    }
    if (result.isHigh) {
      return 1;
    }
    if (result.isLow) {
      return 0;
    }
    return "X";
  }
  function evaluateAdder(pins) {
    const model = CHIP_MODELS["74LS283"];
    const outputs = {};
    let carry = pins[7];
    for (let bit = 0; bit < 4; bit = bit + 1) {
      const first = pins[model.first[bit]];
      const second = pins[model.second[bit]];
      const different = logicGate("xor", first, second);
      const sum = logicGate("xor", different, carry);
      const firstCarry = logicGate("and", first, second);
      const secondCarry = logicGate("and", different, carry);
      carry = logicGate("or", firstCarry, secondCarry);
      outputs[model.outputs[bit]] = sum;
    }
    outputs[9] = carry;
    return outputs;
  }

  // src/board.mjs
  var BOARD = { columns: 59, sections: 4, startX: 90, pitch: 18, startY: 116, sectionHeight: 250, width: 1300, height: 1215, panelLeft: 42, panelWidth: 1132 };
  var PORT_LAYOUT = { lowestColumn: 49, columnStep: 2, positiveColumn: 53, negativeColumn: 57, outputY: 68, inputY: 1105 };
  var ROWS = "ABCDEFGHIJ";
  var BUS_ROWS = "XY";
  var BUS_SEGMENTS = [[1, 17], [19, 41], [43, 59]];
  var IO_LIMIT = 24;
  var NOTES_LIMIT = 5e4;
  var GENERAL_NOTES = "# \u7535\u8DEF\u8BF4\u660E\n\n## \u529F\u80FD\n\n\u586B\u5199\u8FD9\u4E2A\u7535\u8DEF\u7684\u7528\u9014\n\n## \u8F93\u5165\u53E3\n\n| \u7AEF\u53E3 | \u4F5C\u7528 |\n| --- | --- |\n| K0 | \u5F85\u586B\u5199 |\n\n## \u8F93\u51FA\u53E3\n\n| \u7AEF\u53E3 | \u4F5C\u7528 |\n| --- | --- |\n| L0 | \u5F85\u586B\u5199 |\n\n## \u64CD\u4F5C\u6B65\u9AA4\n\n1. \u68C0\u67E5\u4F9B\u7535\u548C\u63A5\u7EBF\n2. \u8BBE\u7F6E\u8F93\u5165\uFF0C\u89C2\u5BDF\u8F93\u51FA\n";
  var WIRE_COLORS = ["#dc3545", "#1976d2", "#16845b", "#d68a0b", "#8b55c5", "#0d939d", "#d44f93", "#46515f", "#93a619", "#e26c2b", "#8494a7", "#65483d"];
  function columnX(column) {
    return BOARD.startX + (column - 1) * BOARD.pitch;
  }
  function rowY(section, row) {
    if (row === "X") {
      return BOARD.startY + section * BOARD.sectionHeight - 16;
    }
    if (row === "Y") {
      return BOARD.startY + section * BOARD.sectionHeight + 193;
    }
    let offset = ROWS.indexOf(row) * 15;
    if (ROWS.indexOf(row) >= 5) {
      offset = offset + 35;
    }
    return BOARD.startY + section * BOARD.sectionHeight + offset;
  }
  function busHasHole(column) {
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns && column % 6 !== 0;
  }
  function busSegment(column) {
    for (let index = 0; index < BUS_SEGMENTS.length; index = index + 1) {
      const segment = BUS_SEGMENTS[index];
      if (column >= segment[0] && column <= segment[1]) {
        return index;
      }
    }
    return -1;
  }
  function holeId(section, row, column) {
    return "B" + section + ":" + row + ":" + column;
  }
  function validEndpoint(name) {
    if (typeof name !== "string") {
      return false;
    }
    if (/^(K|L)([0-9]|1[0-9]|2[0-3])$/.test(name)) {
      return true;
    }
    if (/^(P\+|P-|GND|VCC)$/.test(name)) {
      return true;
    }
    if (/^R:(GND|VCC):([0-9]|[1-4][0-9]|5[0-9])$/.test(name)) {
      return true;
    }
    const parts = name.split(":");
    if (parts.length !== 3 || !/^B[0-3]$/.test(parts[0])) {
      return false;
    }
    if (parts[1].length !== 1 || !ROWS.includes(parts[1]) && !BUS_ROWS.includes(parts[1])) {
      return false;
    }
    if (!/^([1-9]|[1-5][0-9])$/.test(parts[2])) {
      return false;
    }
    const column = Number(parts[2]);
    if (BUS_ROWS.includes(parts[1])) {
      return busHasHole(column);
    }
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns;
  }
  function baseNode(name) {
    if (name === "GND" || name.startsWith("R:GND:")) {
      return "GND";
    }
    if (name === "VCC" || name.startsWith("R:VCC:")) {
      return "VCC";
    }
    if (!name.startsWith("B")) {
      return name;
    }
    const parts = name.split(":");
    if (BUS_ROWS.includes(parts[1])) {
      return parts[0] + ":" + parts[1] + ":segment" + busSegment(Number(parts[2]));
    }
    let side = "upper";
    if (ROWS.indexOf(parts[1]) >= 5) {
      side = "lower";
    }
    return parts[0] + ":" + side + ":" + parts[2];
  }
  function pinHole(chip, pin) {
    const count = CHIP_MODELS[chip.model].count;
    const half = count / 2;
    let column = chip.column + pin - 1;
    let row = "F";
    if (pin > half) {
      column = chip.column + count - pin;
      row = "E";
    }
    return holeId(chip.section, row, column);
  }
  function endpointPosition(name) {
    if (name.startsWith("B")) {
      const parts = name.split(":");
      const section = Number(parts[0].slice(1));
      return { x: columnX(Number(parts[2])), y: rowY(section, parts[1]) };
    }
    if (name.startsWith("R:")) {
      const parts = name.split(":");
      let horizontal = 1210;
      if (parts[1] === "VCC") {
        horizontal = 1242;
      }
      return { x: horizontal, y: 102 + Number(parts[2]) * 18 };
    }
    if (name.startsWith("K") || name.startsWith("L")) {
      const number = Number(name.slice(1));
      const column = PORT_LAYOUT.lowestColumn - number * PORT_LAYOUT.columnStep;
      let vertical = PORT_LAYOUT.inputY;
      if (name.startsWith("L")) {
        vertical = PORT_LAYOUT.outputY;
      }
      return { x: columnX(column), y: vertical };
    }
    if (name === "P+") {
      return { x: columnX(PORT_LAYOUT.positiveColumn), y: PORT_LAYOUT.inputY };
    }
    if (name === "P-") {
      return { x: columnX(PORT_LAYOUT.negativeColumn), y: PORT_LAYOUT.inputY };
    }
    if (name === "GND") {
      return { x: 1210, y: PORT_LAYOUT.inputY };
    }
    return { x: 1242, y: PORT_LAYOUT.inputY };
  }
  function endpointLabel(name) {
    if (name.startsWith("B")) {
      const parts = name.split(":");
      const section = Number(parts[0].slice(1)) + 1;
      return "\u7B2C" + section + "\u5757 " + parts[1] + parts[2];
    }
    if (name.startsWith("R:")) {
      const parts = name.split(":");
      return "\u53F3\u4FA7 " + parts[1] + " \u7B2C" + (Number(parts[2]) + 1) + "\u5B54";
    }
    return name;
  }
  function placementError(chips, candidate, ignoredId) {
    if (!Object.hasOwn(CHIP_MODELS, candidate.model)) {
      return "\u4E0D\u652F\u6301\u8FD9\u4E2A\u82AF\u7247\u578B\u53F7";
    }
    const half = CHIP_MODELS[candidate.model].count / 2;
    if (!Number.isInteger(candidate.section) || candidate.section < 0 || candidate.section >= BOARD.sections) {
      return "\u8BF7\u628A\u82AF\u7247\u653E\u5728\u5DF2\u6709\u7684\u9762\u5305\u677F\u4E0A";
    }
    if (!Number.isInteger(candidate.column) || candidate.column < 1 || candidate.column + half - 1 > BOARD.columns) {
      return "\u82AF\u7247\u5F15\u811A\u8D85\u51FA\u4E86\u9762\u5305\u677F\u8303\u56F4";
    }
    for (const chip of chips) {
      if (chip.id === ignoredId || chip.section !== candidate.section) {
        continue;
      }
      const last = chip.column + CHIP_MODELS[chip.model].count / 2 - 1;
      const candidateLast = candidate.column + half - 1;
      if (candidate.column <= last && candidateLast >= chip.column) {
        return "\u6B64\u5904\u5DF2\u6709\u82AF\u7247\uFF0C\u8BF7\u6362\u4E00\u7EC4\u7A7A\u5217";
      }
    }
    return "";
  }
  function emptyProject() {
    const switches = [];
    for (let index = 0; index < 24; index = index + 1) {
      switches.push(0);
    }
    return { version: 1, inputCount: 8, outputCount: 8, notes: GENERAL_NOTES, name: "\u672A\u547D\u540D\u7535\u8DEF", chips: [], wires: [], pullUps: [], switches, power: true };
  }
  function copyProject(project) {
    return JSON.parse(JSON.stringify(project));
  }

  // src/chip-logic.mjs
  function logicValue(value) {
    if (value === 0 || value === 1) {
      return value;
    }
    return "X";
  }
  function andValues(values) {
    let result = 1;
    for (const value of values) {
      result = logicGate("and", result, value);
    }
    return result;
  }
  function readNumber(pins, order) {
    let result = 0;
    for (let bit = 0; bit < order.length; bit = bit + 1) {
      const value = logicValue(pins[order[bit]]);
      if (value === "X") {
        return "X";
      }
      result = result + value * 2 ** bit;
    }
    return result;
  }
  function possibleAddresses(pins, order) {
    const possible = [];
    for (let number = 0; number < 2 ** order.length; number = number + 1) {
      let matches = true;
      for (let bit = 0; bit < order.length; bit = bit + 1) {
        const value = logicValue(pins[order[bit]]);
        if (value !== "X" && value !== (number >> bit & 1)) {
          matches = false;
        }
      }
      if (matches) {
        possible.push(number);
      }
    }
    return possible;
  }
  function commonValue(values) {
    const first = values[0];
    for (const value of values) {
      if (value !== first) {
        return "X";
      }
    }
    return first;
  }
  function decode(pins, addressPins, enable, outputPins, outputs) {
    const addresses = possibleAddresses(pins, addressPins);
    for (let index = 0; index < outputPins.length; index = index + 1) {
      const candidates = [];
      for (const address of addresses) {
        let match = 0;
        if (address === index) {
          match = 1;
        }
        const active = logicGate("and", enable, match);
        candidates.push(logicGate("not", active, 0));
      }
      outputs[outputPins[index]] = commonValue(candidates);
    }
  }
  function multiplex(pins, addressPins, dataPins, enable) {
    const candidates = [];
    for (const address of possibleAddresses(pins, addressPins)) {
      candidates.push(logicValue(pins[dataPins[address]]));
    }
    return logicGate("and", enable, commonValue(candidates));
  }
  function compare(pins, outputs) {
    const first = readNumber(pins, [10, 12, 14, 15]);
    const second = readNumber(pins, [9, 11, 13, 1]);
    outputs[5] = "X";
    outputs[6] = "X";
    outputs[7] = "X";
    if (first === "X" || second === "X") {
      return;
    }
    if (first !== second) {
      outputs[5] = 0;
      outputs[6] = 0;
      outputs[7] = 0;
      if (first > second) {
        outputs[5] = 1;
      } else {
        outputs[7] = 1;
      }
      return;
    }
    outputs[6] = logicValue(pins[3]);
    const notEqual = logicGate("not", pins[3], 0);
    const notLess = logicGate("not", pins[2], 0);
    const notGreater = logicGate("not", pins[4], 0);
    outputs[5] = logicGate("and", notEqual, notLess);
    outputs[7] = logicGate("and", notEqual, notGreater);
  }
  function sevenSegment(pins, outputs) {
    const patterns = ["1111110", "0110000", "1101101", "1111001", "0110011", "1011011", "1011111", "1110000", "1111111", "1111011", "0001101", "0011001", "0100011", "1001011", "0001111", "0000000"];
    const segmentPins = [13, 12, 11, 10, 9, 15, 14];
    const number = readNumber(pins, [7, 1, 2, 6]);
    const blankZero = number === 0 && pins[5] === 0 && pins[3] === 1;
    outputs[4] = "Z";
    if (blankZero) {
      outputs[4] = 0;
    }
    for (let index = 0; index < segmentPins.length; index = index + 1) {
      let value = "X";
      if (pins[4] === 0 || blankZero) {
        value = 0;
      } else if (pins[3] === 0 && pins[4] === 1) {
        value = 1;
      } else if (pins[3] === 1 && pins[4] === 1 && number !== "X") {
        if (number !== 0 || pins[5] === 1) {
          value = Number(patterns[number][index]);
        }
      }
      outputs[segmentPins[index]] = value;
    }
  }
  function evaluateExtra(model, pins) {
    const outputs = {};
    if (model.kind === "cmos-nand" || model.kind === "open-collector" || model.kind === "nand4" || model.kind === "tristate") {
      for (const gate of model.gates) {
        const outputPin = gate[gate.length - 1];
        let value = "X";
        if (model.kind === "tristate") {
          if (pins[gate[0]] === 1) {
            value = "Z";
          } else if (pins[gate[0]] === 0) {
            value = logicValue(pins[gate[1]]);
          }
        } else {
          const inputs = [];
          for (let index = 0; index < gate.length - 1; index = index + 1) {
            inputs.push(pins[gate[index]]);
          }
          value = logicGate("not", andValues(inputs), 0);
          if (model.kind === "open-collector" && value === 1) {
            value = "Z";
          }
        }
        outputs[outputPin] = value;
      }
    } else if (model.kind === "decoder8") {
      const enable = andValues([pins[6], logicGate("not", pins[4], 0), logicGate("not", pins[5], 0)]);
      decode(pins, [1, 2, 3], enable, model.outputs, outputs);
    } else if (model.kind === "dual-decoder") {
      decode(pins, [2, 3], logicGate("not", pins[1], 0), [4, 5, 6, 7], outputs);
      decode(pins, [14, 13], logicGate("not", pins[15], 0), [12, 11, 10, 9], outputs);
    } else if (model.kind === "mux8") {
      outputs[5] = multiplex(pins, [11, 10, 9], [4, 3, 2, 1, 15, 14, 13, 12], logicGate("not", pins[7], 0));
      outputs[6] = logicGate("not", outputs[5], 0);
    } else if (model.kind === "dual-mux") {
      outputs[7] = multiplex(pins, [14, 2], [6, 5, 4, 3], logicGate("not", pins[1], 0));
      outputs[9] = multiplex(pins, [14, 2], [10, 11, 12, 13], logicGate("not", pins[15], 0));
    } else if (model.kind === "comparator") {
      compare(pins, outputs);
    } else if (model.kind === "seven-segment") {
      sevenSegment(pins, outputs);
    }
    return outputs;
  }

  // src/chip-state.mjs
  function unknownBits(count) {
    const bits = [];
    for (let index = 0; index < count; index = index + 1) {
      bits.push("X");
    }
    return bits;
  }
  function createChipState(model) {
    let count = 4;
    if (model.sequential === "flipflop") {
      count = 2;
    }
    const clocks = unknownBits(count);
    return { bits: unknownBits(count), inverted: unknownBits(count), clocks };
  }
  function hasEdge(previous, current, edge) {
    if (edge === "falling") {
      return previous === 1 && current === 0;
    }
    return previous === 0 && current === 1;
  }
  function uncertainEdge(previous, current, edge) {
    const first = logicValue(previous);
    const last = logicValue(current);
    if (first !== "X" && last !== "X") {
      return false;
    }
    if (edge === "falling") {
      return first !== 0 && last !== 1;
    }
    return first !== 1 && last !== 0;
  }
  function nextJk(first, second, previous) {
    const setPart = logicGate("and", first, logicGate("not", previous, 0));
    const keepPart = logicGate("and", logicGate("not", second, 0), previous);
    return logicGate("or", setPart, keepPart);
  }
  function updateFlipFlops(model, pins, state2) {
    const bits = [];
    const inverted = [];
    for (let index = 0; index < model.channels.length; index = index + 1) {
      const channel = model.channels[index];
      let active = 0;
      if (model.activeHigh) {
        active = 1;
      }
      const reset = logicValue(pins[channel.reset]);
      const set = logicValue(pins[channel.set]);
      let value = state2.bits[index];
      let inverse = state2.inverted[index];
      if (reset === active && set === active) {
        value = 1;
        inverse = 1;
      } else if (reset === active) {
        value = 0;
        inverse = 1;
      } else if (set === active) {
        value = 1;
        inverse = 0;
      } else if (reset === "X" || set === "X") {
        value = "X";
        inverse = "X";
      } else {
        if (value === inverse) {
          value = "X";
        }
        if (hasEdge(state2.clocks[index], pins[channel.clock], model.edge)) {
          if (channel.data) {
            value = logicValue(pins[channel.data]);
          } else {
            value = nextJk(pins[channel.first], pins[channel.second], value);
          }
        } else if (uncertainEdge(state2.clocks[index], pins[channel.clock], model.edge)) {
          value = "X";
        }
        inverse = logicGate("not", value, 0);
      }
      bits.push(value);
      inverted.push(inverse);
      state2.clocks[index] = logicValue(pins[channel.clock]);
    }
    state2.bits = bits;
    state2.inverted = inverted;
  }
  function storedNumber(bits) {
    let value = 0;
    for (let bit = 0; bit < bits.length; bit = bit + 1) {
      if (bits[bit] !== 0 && bits[bit] !== 1) {
        return "X";
      }
      value = value + bits[bit] * 2 ** bit;
    }
    return value;
  }
  function numberBits(number) {
    if (number === "X") {
      return unknownBits(4);
    }
    const bits = [];
    for (let bit = 0; bit < 4; bit = bit + 1) {
      bits.push(number >> bit & 1);
    }
    return bits;
  }
  function updateCounter(model, pins, state2) {
    const edge = hasEdge(state2.clocks[0], pins[2], "rising");
    if (pins[1] === 0) {
      state2.bits = [0, 0, 0, 0];
    } else if (pins[1] !== 1) {
      state2.bits = unknownBits(4);
    } else if (edge) {
      if (pins[9] === 0) {
        state2.bits = numberBits(readNumber(pins, [3, 4, 5, 6]));
      } else if (pins[9] !== 1) {
        state2.bits = unknownBits(4);
      } else {
        const enable = andValues([pins[7], pins[10]]);
        if (enable === 1) {
          const current = storedNumber(state2.bits);
          if (current === "X") {
            state2.bits = unknownBits(4);
          } else if (current === model.modulus - 1) {
            state2.bits = [0, 0, 0, 0];
          } else {
            state2.bits = numberBits(current + 1 & 15);
          }
        } else if (enable === "X") {
          state2.bits = unknownBits(4);
        }
      }
    } else if (uncertainEdge(state2.clocks[0], pins[2], "rising")) {
      state2.bits = unknownBits(4);
    }
    state2.clocks[0] = logicValue(pins[2]);
  }
  function updateShift(pins, state2) {
    if (pins[1] === 0) {
      state2.bits = [0, 0, 0, 0];
    } else if (pins[1] !== 1) {
      state2.bits = unknownBits(4);
    } else if (hasEdge(state2.clocks[0], pins[2], "rising")) {
      const mode = readNumber(pins, [9, 10]);
      const previous = state2.bits;
      if (mode === 1) {
        state2.bits = [logicValue(pins[3]), previous[0], previous[1], previous[2]];
      } else if (mode === 2) {
        state2.bits = [previous[1], previous[2], previous[3], logicValue(pins[11])];
      } else if (mode === 3) {
        state2.bits = [logicValue(pins[4]), logicValue(pins[5]), logicValue(pins[6]), logicValue(pins[7])];
      } else if (mode === "X") {
        state2.bits = unknownBits(4);
      }
    } else if (uncertainEdge(state2.clocks[0], pins[2], "rising")) {
      state2.bits = unknownBits(4);
    }
    state2.clocks[0] = logicValue(pins[2]);
  }
  function updateChipState(model, pins, state2, powered) {
    const before = JSON.stringify([state2.bits, state2.inverted]);
    if (!powered) {
      state2.bits = unknownBits(state2.bits.length);
      state2.inverted = unknownBits(state2.inverted.length);
      state2.clocks = unknownBits(state2.clocks.length);
    } else if (model.sequential === "flipflop") {
      updateFlipFlops(model, pins, state2);
    } else if (model.sequential === "counter") {
      updateCounter(model, pins, state2);
    } else if (model.sequential === "shift") {
      updateShift(pins, state2);
    }
    return before !== JSON.stringify([state2.bits, state2.inverted]);
  }
  function stateOutputs(model, pins, state2) {
    const outputs = {};
    if (model.sequential === "flipflop") {
      for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        outputs[channel.output] = state2.bits[index];
        outputs[channel.inverted] = state2.inverted[index];
      }
    } else {
      for (let bit = 0; bit < 4; bit = bit + 1) {
        outputs[model.outputs[bit]] = state2.bits[bit];
      }
      if (model.sequential === "counter") {
        const number = storedNumber(state2.bits);
        let terminal = "X";
        if (number !== "X") {
          terminal = 0;
          if (number === model.modulus - 1) {
            terminal = 1;
          }
        }
        outputs[15] = logicGate("and", terminal, pins[10]);
      }
    }
    return outputs;
  }

  // src/engine.mjs
  var MAX_SETTLE_PASSES = 96;
  var MAX_SEQUENTIAL_PASSES = 12;
  function buildTopology(project) {
    const parents = {};
    for (const wire of project.wires) {
      const first = baseNode(wire.from);
      const second = baseNode(wire.to);
      ensureNode(parents, first);
      ensureNode(parents, second);
      const firstRoot = findRoot(parents, first);
      const secondRoot = findRoot(parents, second);
      parents[secondRoot] = firstRoot;
    }
    return parents;
  }
  function ensureNode(parents, name) {
    if (!Object.hasOwn(parents, name)) {
      parents[name] = name;
    }
  }
  function findRoot(parents, name) {
    ensureNode(parents, name);
    let root = name;
    while (parents[root] !== root) {
      root = parents[root];
    }
    return root;
  }
  function nodeFor(topology, endpoint) {
    return findRoot(topology, baseNode(endpoint));
  }
  function addDriver(drivers, node2, value, source, kind = "push-pull") {
    if (value === "Z") {
      return;
    }
    if (!Object.hasOwn(drivers, node2)) {
      drivers[node2] = [];
    }
    drivers[node2].push({ value, source, kind });
  }
  function resolveDrivers(drivers) {
    if (!drivers || drivers.length === 0) {
      return "Z";
    }
    let result = "Z";
    let pullUp = false;
    for (const driver of drivers) {
      if (driver.kind === "pull-up") {
        pullUp = true;
        continue;
      }
      if (result === "Z") {
        result = driver.value;
      } else if (driver.value === "X" || driver.value !== result) {
        result = "X";
      }
    }
    if (result === "Z" && pullUp) {
      return 1;
    }
    return result;
  }
  function readEndpoint(result, endpoint) {
    const node2 = nodeFor(result.topology, endpoint);
    if (!Object.hasOwn(result.values, node2)) {
      return "Z";
    }
    return result.values[node2];
  }
  function readPins(chip, topology, values) {
    const pins = {};
    const model = CHIP_MODELS[chip.model];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      const hole = pinHole(chip, pin);
      const node2 = nodeFor(topology, hole);
      pins[pin] = "Z";
      if (Object.hasOwn(values, node2)) {
        pins[pin] = values[node2];
      }
    }
    return pins;
  }
  function chipPowered(chip, pins) {
    const model = CHIP_MODELS[chip.model];
    return pins[model.power] === 1 && pins[model.ground] === 0;
  }
  function initialRegister() {
    const bits = [];
    for (let index = 0; index < 8; index = index + 1) {
      bits.push("X");
    }
    return { bits, clock: "X", powered: false };
  }
  function chipOutputs(chip, pins, registers, devices) {
    const model = CHIP_MODELS[chip.model];
    const outputs = {};
    if (!chipPowered(chip, pins)) {
      return outputs;
    }
    if (chip.model === "74LS273") {
      const register = registers[chip.id];
      for (let bit = 0; bit < 8; bit = bit + 1) {
        outputs[model.outputs[bit]] = register.bits[bit];
      }
      return outputs;
    }
    if (chip.model === "74LS283") {
      return evaluateAdder(pins);
    }
    if (model.sequential) {
      return stateOutputs(model, pins, devices[chip.id]);
    }
    if (model.kind) {
      return evaluateExtra(model, pins);
    }
    for (const gate of model.gates) {
      outputs[gate[2]] = logicGate(model.operation, pins[gate[0]], pins[gate[1]]);
    }
    return outputs;
  }
  function collectDrivers(project, topology, values, registers, pulses, devices, previousDrivers) {
    const drivers = {};
    if (project.power) {
      addDriver(drivers, nodeFor(topology, "VCC"), 1, "+5V");
      addDriver(drivers, nodeFor(topology, "GND"), 0, "GND");
      for (let index = 0; index < 24; index = index + 1) {
        const name = "K" + index;
        addDriver(drivers, nodeFor(topology, name), project.switches[index], name);
      }
      addDriver(drivers, nodeFor(topology, "P+"), pulses.positive, "P+");
      addDriver(drivers, nodeFor(topology, "P-"), pulses.negative, "P\u2212");
      for (const endpoint of project.pullUps || []) {
        addDriver(drivers, nodeFor(topology, endpoint), 1, "\u4E0A\u62C9 " + endpoint, "pull-up");
      }
      for (const chip of project.chips) {
        const pins = readPins(chip, topology, values);
        const model = CHIP_MODELS[chip.model];
        if (model.bidirectional) {
          for (const pin of model.bidirectional) {
            const node2 = nodeFor(topology, pinHole(chip, pin));
            const external = [];
            const source = chip.id + "-" + pin;
            const entries2 = previousDrivers[node2] || [];
            for (const driver of entries2) {
              if (driver.source !== source) {
                external.push(driver);
              }
            }
            pins[pin] = resolveDrivers(external);
          }
        }
        const outputs = chipOutputs(chip, pins, registers, devices);
        for (const pin in outputs) {
          const hole = pinHole(chip, Number(pin));
          let kind = "push-pull";
          if (model.kind === "open-collector" || model.bidirectional && model.bidirectional.includes(Number(pin))) {
            kind = "open-collector";
          }
          addDriver(drivers, nodeFor(topology, hole), outputs[pin], chip.id + "-" + pin, kind);
        }
      }
    }
    return drivers;
  }
  function driverValues(drivers) {
    const values = {};
    for (const name in drivers) {
      values[name] = resolveDrivers(drivers[name]);
    }
    return values;
  }
  function sameValues(first, second) {
    const names = Object.keys(first);
    if (names.length !== Object.keys(second).length) {
      return false;
    }
    for (const name of names) {
      if (first[name] !== second[name]) {
        return false;
      }
    }
    return true;
  }
  function settle(project, topology, registers, pulses, devices) {
    let values = {};
    let drivers = {};
    for (let pass = 0; pass < MAX_SETTLE_PASSES; pass = pass + 1) {
      drivers = collectDrivers(project, topology, values, registers, pulses, devices, drivers);
      const next = driverValues(drivers);
      if (sameValues(values, next)) {
        return { values: next, drivers, stable: true };
      }
      values = next;
    }
    for (const name in values) {
      values[name] = "X";
    }
    return { values, drivers, stable: false };
  }
  function updateRegisters(project, topology, values, registers) {
    let changed = false;
    for (const chip of project.chips) {
      if (chip.model !== "74LS273") {
        continue;
      }
      const register = registers[chip.id];
      const pins = readPins(chip, topology, values);
      const powered = project.power && chipPowered(chip, pins);
      const nextBits = [];
      for (let bit = 0; bit < 8; bit = bit + 1) {
        let value = register.bits[bit];
        if (!powered) {
          value = "X";
        } else if (pins[1] === 0) {
          value = 0;
        } else if (pins[1] !== 1) {
          value = "X";
        } else if (register.clock === 0 && pins[11] === 1) {
          value = pins[CHIP_MODELS[chip.model].data[bit]];
          if (value !== 0 && value !== 1) {
            value = "X";
          }
        } else if (register.clock === 0 && pins[11] !== 0 || register.clock !== 1 && register.clock !== 0 && pins[11] !== 0) {
          value = "X";
        }
        nextBits.push(value);
        if (value !== register.bits[bit]) {
          changed = true;
        }
      }
      register.bits = nextBits;
      register.clock = pins[11];
      register.powered = powered;
    }
    return changed;
  }
  function diagnose(project, result) {
    const issues = [];
    if (!project.power) {
      return issues;
    }
    if (nodeFor(result.topology, "VCC") === nodeFor(result.topology, "GND")) {
      issues.push({ code: "power-short", severity: "error", message: "+5V \u4E0E GND \u88AB\u5BFC\u7EBF\u77ED\u63A5\uFF0C\u8BF7\u65AD\u5F00\u5BF9\u5E94\u8FDE\u7EBF" });
    }
    for (const node2 in result.drivers) {
      const drivers = [];
      let pushPull = 0;
      for (const driver of result.drivers[node2]) {
        if (driver.kind !== "pull-up") {
          drivers.push(driver);
          if (driver.kind === "push-pull") {
            pushPull = pushPull + 1;
          }
        }
      }
      if (drivers.length > 1 && pushPull > 0) {
        let sources = "";
        let high = false;
        let low = false;
        for (const driver of drivers) {
          if (sources !== "") {
            sources = sources + "\u3001";
          }
          sources = sources + driver.source;
          if (driver.value === 1) {
            high = true;
          }
          if (driver.value === 0) {
            low = true;
          }
        }
        let message = "\u591A\u4E2A\u63A8\u633D\u8F93\u51FA\u8FDE\u63A5\u5230\u540C\u4E00\u8282\u70B9\uFF1A" + sources;
        if (high && low) {
          message = "\u9AD8\u4F4E\u7535\u5E73\u51B2\u7A81\uFF1A" + sources + "\uFF0C\u6B64\u8282\u70B9\u7ED3\u679C\u4E3A X";
        }
        issues.push({ code: "drivers:" + node2, severity: "error", message });
      }
    }
    for (const chip of project.chips) {
      const pins = readPins(chip, result.topology, result.values);
      if (!chipPowered(chip, pins)) {
        issues.push({ code: "power:" + chip.id, severity: "error", message: chip.id + " \u7535\u6E90\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5 VCC \u548C GND" });
        continue;
      }
      const missing = [];
      for (const pin of CHIP_MODELS[chip.model].inputs) {
        if (pins[pin] === "Z") {
          missing.push(String(pin));
        }
      }
      if (missing.length > 0) {
        issues.push({ code: "floating:" + chip.id, severity: "warning", message: chip.id + " \u8F93\u5165\u60AC\u7A7A\uFF1A\u7B2C " + missing.join("\u3001") + " \u811A" });
      }
    }
    if (!result.stable) {
      issues.push({ code: "unstable", severity: "error", message: "\u7535\u8DEF\u672A\u8FBE\u5230\u7A33\u5B9A\u72B6\u6001\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u5408\u903B\u8F91\u53CD\u9988" });
    }
    return issues;
  }
  function createRuntime() {
    return { registers: {}, devices: {}, pulses: { positive: 0, negative: 1 } };
  }
  function simulate(project, runtime) {
    const topology = buildTopology(project);
    for (const chip of project.chips) {
      if (chip.model === "74LS273" && !Object.hasOwn(runtime.registers, chip.id)) {
        runtime.registers[chip.id] = initialRegister();
      }
      const model = CHIP_MODELS[chip.model];
      if (model.sequential && !Object.hasOwn(runtime.devices, chip.id)) {
        runtime.devices[chip.id] = createChipState(model);
      }
    }
    let settled = settle(project, topology, runtime.registers, runtime.pulses, runtime.devices);
    let complete = false;
    for (let pass = 0; pass < MAX_SEQUENTIAL_PASSES; pass = pass + 1) {
      let changed = updateRegisters(project, topology, settled.values, runtime.registers);
      for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        if (model.sequential) {
          const pins = readPins(chip, topology, settled.values);
          const updated = updateChipState(model, pins, runtime.devices[chip.id], project.power && chipPowered(chip, pins));
          changed = changed || updated;
        }
      }
      if (!changed) {
        complete = true;
        break;
      }
      settled = settle(project, topology, runtime.registers, runtime.pulses, runtime.devices);
    }
    const result = { topology, values: settled.values, drivers: settled.drivers, stable: settled.stable && complete, issues: [] };
    result.issues = diagnose(project, result);
    return result;
  }

  // src/preset-routes.json
  var preset_routes_default = {
    W12: [
      {
        x: 540,
        y: 396
      }
    ],
    W14: [
      {
        x: 810,
        y: 648
      },
      {
        x: 792,
        y: 648
      }
    ],
    W16: [
      {
        x: 846,
        y: 648
      },
      {
        x: 864,
        y: 648
      }
    ],
    W18: [
      {
        x: 936,
        y: 396
      }
    ],
    W20: [
      {
        x: 882,
        y: 396
      }
    ],
    W19: [
      {
        x: 912,
        y: 396
      },
      {
        x: 912,
        y: 414
      },
      {
        x: 900,
        y: 414
      }
    ],
    W15: [
      {
        x: 792,
        y: 636
      },
      {
        x: 834,
        y: 636
      },
      {
        x: 834,
        y: 660
      },
      {
        x: 846,
        y: 660
      }
    ],
    W31: [
      {
        x: 144,
        y: 504
      },
      {
        x: 198,
        y: 504
      }
    ],
    W33: [
      {
        x: 144,
        y: 396
      }
    ],
    W37: [
      {
        x: 792,
        y: 756
      }
    ],
    W32: [
      {
        x: 198,
        y: 504
      },
      {
        x: 252,
        y: 504
      },
      {
        x: 252,
        y: 414
      },
      {
        x: 198,
        y: 414
      }
    ],
    W36: [
      {
        x: 900,
        y: 678
      },
      {
        x: 918,
        y: 678
      },
      {
        x: 918,
        y: 744
      },
      {
        x: 864,
        y: 744
      }
    ],
    W17: [
      {
        x: 864,
        y: 474
      },
      {
        x: 846,
        y: 474
      },
      {
        x: 846,
        y: 426
      },
      {
        x: 954,
        y: 426
      }
    ],
    W42: [
      {
        x: 468,
        y: 492
      },
      {
        x: 630,
        y: 492
      }
    ],
    W45: [
      {
        x: 522,
        y: 744
      },
      {
        x: 432,
        y: 744
      }
    ],
    W41: [
      {
        x: 414,
        y: 480
      },
      {
        x: 612,
        y: 480
      }
    ],
    W47: [
      {
        x: 594,
        y: 672
      },
      {
        x: 396,
        y: 672
      }
    ],
    W39: [
      {
        x: 414,
        y: 756
      },
      {
        x: 540,
        y: 756
      }
    ],
    W57: [
      {
        x: 648,
        y: 384
      },
      {
        x: 990,
        y: 384
      },
      {
        x: 990,
        y: 492
      },
      {
        x: 918,
        y: 492
      }
    ],
    W48: [
      {
        x: 648,
        y: 492
      },
      {
        x: 684,
        y: 492
      },
      {
        x: 684,
        y: 426
      },
      {
        x: 432,
        y: 426
      }
    ],
    W26: [
      {
        x: 234,
        y: 402
      },
      {
        x: 378,
        y: 402
      }
    ],
    W3: [
      {
        x: 390,
        y: 396
      },
      {
        x: 390,
        y: 666
      },
      {
        x: 360,
        y: 666
      }
    ],
    W24: [
      {
        x: 216,
        y: 744
      },
      {
        x: 378,
        y: 744
      }
    ],
    W4: [
      {
        x: 666,
        y: 768
      },
      {
        x: 486,
        y: 768
      }
    ],
    W5: [
      {
        x: 360,
        y: 648
      },
      {
        x: 342,
        y: 648
      },
      {
        x: 342,
        y: 732
      },
      {
        x: 402,
        y: 732
      },
      {
        x: 402,
        y: 780
      },
      {
        x: 756,
        y: 780
      },
      {
        x: 756,
        y: 660
      },
      {
        x: 774,
        y: 660
      }
    ],
    W6: [
      {
        x: 480,
        y: 756
      },
      {
        x: 480,
        y: 792
      },
      {
        x: 900,
        y: 792
      }
    ],
    W46: [
      {
        x: 576,
        y: 726
      },
      {
        x: 396,
        y: 726
      }
    ],
    W40: [
      {
        x: 360,
        y: 804
      },
      {
        x: 558,
        y: 804
      }
    ],
    W58: [
      {
        x: 594,
        y: 384
      },
      {
        x: 636,
        y: 384
      },
      {
        x: 636,
        y: 372
      },
      {
        x: 1002,
        y: 372
      },
      {
        x: 1002,
        y: 504
      },
      {
        x: 936,
        y: 504
      }
    ],
    W38: [
      {
        x: 486,
        y: 660
      },
      {
        x: 744,
        y: 660
      },
      {
        x: 744,
        y: 732
      },
      {
        x: 882,
        y: 732
      }
    ],
    W55: [
      {
        x: 588,
        y: 396
      },
      {
        x: 588,
        y: 66
      },
      {
        x: 810,
        y: 66
      }
    ],
    W44: [
      {
        x: 774,
        y: 744
      },
      {
        x: 696,
        y: 744
      },
      {
        x: 696,
        y: 414
      },
      {
        x: 612,
        y: 414
      }
    ],
    W56: [
      {
        x: 594,
        y: 372
      },
      {
        x: 624,
        y: 372
      },
      {
        x: 624,
        y: 78
      },
      {
        x: 774,
        y: 78
      }
    ],
    W11: [
      {
        x: 972,
        y: 516
      },
      {
        x: 912,
        y: 516
      },
      {
        x: 912,
        y: 486
      },
      {
        x: 708,
        y: 486
      },
      {
        x: 708,
        y: 402
      },
      {
        x: 600,
        y: 402
      },
      {
        x: 600,
        y: 414
      },
      {
        x: 558,
        y: 414
      }
    ],
    W28: [
      {
        x: 180,
        y: 414
      },
      {
        x: 192,
        y: 414
      },
      {
        x: 192,
        y: 402
      },
      {
        x: 222,
        y: 402
      },
      {
        x: 222,
        y: 384
      },
      {
        x: 402,
        y: 384
      },
      {
        x: 402,
        y: 660
      },
      {
        x: 450,
        y: 660
      }
    ],
    W43: [
      {
        x: 828,
        y: 744
      },
      {
        x: 780,
        y: 744
      },
      {
        x: 780,
        y: 756
      },
      {
        x: 684,
        y: 756
      },
      {
        x: 684,
        y: 498
      },
      {
        x: 690,
        y: 498
      },
      {
        x: 690,
        y: 420
      },
      {
        x: 630,
        y: 420
      }
    ],
    W49: [
      {
        x: 648,
        y: 360
      },
      {
        x: 1014,
        y: 360
      },
      {
        x: 1014,
        y: 756
      },
      {
        x: 870,
        y: 756
      },
      {
        x: 870,
        y: 750
      },
      {
        x: 852,
        y: 750
      },
      {
        x: 852,
        y: 744
      },
      {
        x: 846,
        y: 744
      }
    ],
    W13: [
      {
        x: 540,
        y: 348
      },
      {
        x: 780,
        y: 348
      },
      {
        x: 780,
        y: 666
      },
      {
        x: 810,
        y: 666
      }
    ],
    W22: [
      {
        x: 162,
        y: 492
      },
      {
        x: 138,
        y: 492
      },
      {
        x: 138,
        y: 768
      },
      {
        x: 450,
        y: 768
      }
    ],
    W50: [
      {
        x: 594,
        y: 408
      },
      {
        x: 576,
        y: 408
      },
      {
        x: 576,
        y: 336
      },
      {
        x: 1026,
        y: 336
      },
      {
        x: 1026,
        y: 768
      },
      {
        x: 810,
        y: 768
      }
    ],
    W54: [
      {
        x: 648,
        y: 504
      },
      {
        x: 636,
        y: 504
      },
      {
        x: 636,
        y: 474
      },
      {
        x: 486,
        y: 474
      },
      {
        x: 486,
        y: 408
      },
      {
        x: 528,
        y: 408
      },
      {
        x: 528,
        y: 90
      },
      {
        x: 846,
        y: 90
      }
    ],
    W59: [
      {
        x: 954,
        y: 474
      },
      {
        x: 1038,
        y: 474
      },
      {
        x: 1038,
        y: 102
      },
      {
        x: 738,
        y: 102
      }
    ],
    W35: [
      {
        x: 882,
        y: 666
      },
      {
        x: 930,
        y: 666
      },
      {
        x: 930,
        y: 816
      },
      {
        x: 468,
        y: 816
      }
    ],
    W29: [
      {
        x: 810,
        y: 828
      },
      {
        x: 942,
        y: 828
      },
      {
        x: 942,
        y: 528
      },
      {
        x: 888,
        y: 528
      },
      {
        x: 888,
        y: 498
      },
      {
        x: 870,
        y: 498
      },
      {
        x: 870,
        y: 492
      },
      {
        x: 864,
        y: 492
      }
    ],
    W53: [
      {
        x: 594,
        y: 504
      },
      {
        x: 624,
        y: 504
      },
      {
        x: 624,
        y: 516
      },
      {
        x: 654,
        y: 516
      },
      {
        x: 654,
        y: 504
      },
      {
        x: 834,
        y: 504
      },
      {
        x: 834,
        y: 114
      },
      {
        x: 882,
        y: 114
      }
    ],
    W9: [
      {
        x: 126,
        y: 324
      },
      {
        x: 864,
        y: 324
      }
    ],
    W10: [
      {
        x: 234,
        y: 480
      },
      {
        x: 126,
        y: 480
      },
      {
        x: 126,
        y: 840
      },
      {
        x: 978,
        y: 840
      },
      {
        x: 978,
        y: 498
      },
      {
        x: 972,
        y: 498
      }
    ],
    W52: [
      {
        x: 576,
        y: 504
      },
      {
        x: 588,
        y: 504
      },
      {
        x: 588,
        y: 516
      },
      {
        x: 612,
        y: 516
      },
      {
        x: 612,
        y: 804
      },
      {
        x: 1050,
        y: 804
      },
      {
        x: 1050,
        y: 66
      },
      {
        x: 918,
        y: 66
      }
    ],
    W34: [
      {
        x: 132,
        y: 396
      },
      {
        x: 132,
        y: 402
      },
      {
        x: 114,
        y: 402
      },
      {
        x: 114,
        y: 312
      },
      {
        x: 822,
        y: 312
      },
      {
        x: 822,
        y: 480
      },
      {
        x: 882,
        y: 480
      }
    ],
    W60: [
      {
        x: 738,
        y: 1104
      },
      {
        x: 330,
        y: 1104
      },
      {
        x: 330,
        y: 678
      },
      {
        x: 480,
        y: 678
      },
      {
        x: 480,
        y: 504
      },
      {
        x: 504,
        y: 504
      }
    ],
    W51: [
      {
        x: 522,
        y: 504
      },
      {
        x: 510,
        y: 504
      },
      {
        x: 510,
        y: 486
      },
      {
        x: 474,
        y: 486
      },
      {
        x: 474,
        y: 126
      },
      {
        x: 954,
        y: 126
      }
    ],
    W7: [
      {
        x: 774,
        y: 648
      },
      {
        x: 708,
        y: 648
      },
      {
        x: 708,
        y: 828
      },
      {
        x: 108,
        y: 828
      },
      {
        x: 108,
        y: 414
      },
      {
        x: 126,
        y: 414
      }
    ],
    W8: [
      {
        x: 894,
        y: 756
      },
      {
        x: 894,
        y: 780
      },
      {
        x: 768,
        y: 780
      },
      {
        x: 768,
        y: 852
      },
      {
        x: 96,
        y: 852
      },
      {
        x: 96,
        y: 474
      },
      {
        x: 240,
        y: 474
      },
      {
        x: 240,
        y: 492
      },
      {
        x: 234,
        y: 492
      }
    ],
    W61: [
      {
        x: 1098,
        y: 300
      },
      {
        x: 666,
        y: 300
      }
    ],
    W2: [
      {
        x: 1212,
        y: 1105
      },
      {
        x: 1212,
        y: 1104
      },
      {
        x: 1104,
        y: 1104
      },
      {
        x: 1104,
        y: 1110
      },
      {
        x: 750,
        y: 1110
      },
      {
        x: 750,
        y: 864
      },
      {
        x: 654,
        y: 864
      },
      {
        x: 654,
        y: 522
      },
      {
        x: 660,
        y: 522
      },
      {
        x: 660,
        y: 498
      },
      {
        x: 666,
        y: 498
      }
    ],
    W30: [
      {
        x: 774,
        y: 876
      },
      {
        x: 84,
        y: 876
      },
      {
        x: 84,
        y: 486
      },
      {
        x: 144,
        y: 486
      }
    ],
    W23: [
      {
        x: 918,
        y: 888
      },
      {
        x: 180,
        y: 888
      }
    ],
    W25: [
      {
        x: 882,
        y: 900
      },
      {
        x: 72,
        y: 900
      },
      {
        x: 72,
        y: 426
      },
      {
        x: 216,
        y: 426
      }
    ],
    W27: [
      {
        x: 846,
        y: 912
      },
      {
        x: 60,
        y: 912
      },
      {
        x: 60,
        y: 408
      },
      {
        x: 138,
        y: 408
      },
      {
        x: 138,
        y: 414
      },
      {
        x: 162,
        y: 414
      }
    ],
    W1: [
      {
        x: 1242,
        y: 288
      },
      {
        x: 510,
        y: 288
      },
      {
        x: 510,
        y: 414
      },
      {
        x: 504,
        y: 414
      }
    ],
    W21: [
      {
        x: 954,
        y: 924
      },
      {
        x: 48,
        y: 924
      },
      {
        x: 48,
        y: 498
      },
      {
        x: 120,
        y: 498
      },
      {
        x: 120,
        y: 492
      },
      {
        x: 126,
        y: 492
      }
    ]
  };

  // src/presets.mjs
  var COMPLEMENT_NOTES = `# \u53CC\u7B26\u53F7\u4F4D\u8865\u7801\u8FD0\u7B97\u5668

## \u529F\u80FD

\u8FDE\u7EED\u8FDB\u884C\u8865\u7801\u52A0\u3001\u51CF\u8FD0\u7B97\u3002U1\uFF0874LS273\uFF09\u4FDD\u5B58 **\u4E24\u4E2A\u7B26\u53F7\u4F4D\u548C\u56DB\u4E2A\u6570\u503C\u4F4D**\uFF0C\u5171\u516D\u4F4D\uFF0C\u5E76\u628A\u7ED3\u679C\u53CD\u9988\u5230\u4E0B\u4E00\u8F6E\u8FD0\u7B97\u3002U2\u3001U3\uFF0874LS283\uFF09\u8BA1\u7B97\u6570\u503C\u4F4D\u548C\u7B26\u53F7\u4F4D\uFF0CU4\u3001U5\uFF0874LS86\uFF09\u8D1F\u8D23\u8F93\u5165\u53D6\u53CD\u548C\u6EA2\u51FA\u5224\u65AD

## \u8F93\u5165\u53E3

| \u7AEF\u53E3 | \u4F5C\u7528 |
| --- | --- |
| K0\u3001K1\u3001K2\u3001K3 | \u8F93\u5165\u8865\u7801\u7684\u4F4E\u56DB\u4F4D\uFF0CK0 \u6700\u4F4E\u4F4D |
| K4 | \u8F93\u5165\u7B26\u53F7\u4F4D\uFF1B\u7535\u8DEF\u5C06\u6B64\u4F4D\u590D\u5236\u6210\u4E24\u4E2A\u7B26\u53F7\u4F4D |
| K5 | 0 \u4E3A\u52A0\u6CD5\uFF0C1 \u4E3A\u51CF\u6CD5 |
| K6 | 0 \u5F02\u6B65\u6E05\u96F6\uFF0C\u6B63\u5E38\u8FD0\u7B97\u4FDD\u6301 1 |
| P\u2212 | \u5B8C\u6574\u8D1F\u8109\u51B2\u7ED3\u675F\u65F6\u7684\u4E0A\u5347\u6CBF\uFF0C\u4FDD\u5B58\u672C\u6B21\u7ED3\u679C |
| P+ | \u672C\u793A\u4F8B\u672A\u8FDE\u63A5\uFF0C\u4E0D\u4F1A\u52A0\u8F7D\u7ED3\u679C |

\u8F93\u5165\u987A\u5E8F\u4E3A **K4 K3 K2 K1 K0**\uFF0C\u4F7F\u7528\u4E94\u4F4D\u8865\u7801\uFF0C\u8303\u56F4\u4E3A \u221216\uFF5E15\u3002\u4F8B\uFF1A7 \u4E3A 00111\uFF0C\u221212 \u4E3A 10100\uFF0C\u22122 \u4E3A 11110\u3002\u51CF\u53BB 6 \u65F6\u8F93\u5165\u6B63\u6570 00110\uFF0C\u518D\u628A K5 \u8BBE\u7F6E\u4E3A 1

## \u8F93\u51FA\u53E3

| \u7AEF\u53E3 | \u4F5C\u7528 |
| --- | --- |
| L5 | \u9AD8\u7B26\u53F7\u4F4D |
| L4 | \u4F4E\u7B26\u53F7\u4F4D |
| L3\u3001L2\u3001L1\u3001L0 | \u7ED3\u679C\u7684\u56DB\u4E2A\u6570\u503C\u4F4D\uFF0CL0 \u6700\u4F4E\u4F4D |
| L6 | \u4E24\u4E2A\u7B26\u53F7\u4F4D\u5F02\u6216\u7684\u7ED3\u679C\uFF0C1 \u8868\u793A\u5F53\u524D\u7ED3\u679C\u6EA2\u51FA |

\u6309 **L5 L4\uFF5CL3 L2 L1 L0** \u8BFB\u53D6\u3002\u7B26\u53F7 00\u300111 \u4E3A\u672A\u6EA2\u51FA\uFF0C01 \u4E3A\u6B63\u6EA2\u51FA\uFF0C10 \u4E3A\u8D1F\u6EA2\u51FA\u3002\u6240\u6709\u8F93\u5165\u3001\u8F93\u51FA\u6307\u793A\u706F\u5747\u4E3A **\u5DF2\u77E5\u9AD8\u7535\u5E73 1 \u4EAE**\uFF1BX \u6216 Z \u4E0D\u6309\u9AD8\u7535\u5E73\u70B9\u4EAE

## \u64CD\u4F5C\u6B65\u9AA4

1. \u6253\u5F00\u7535\u6E90\uFF0C\u5C06 K6 \u5207\u5230 0 \u518D\u5207\u56DE 1\uFF0CL6\uFF5EL0 \u5E94\u663E\u793A 000 0000
2. \u8BBE\u7F6E K4\uFF5EK0 \u548C\u52A0\u51CF\u63A7\u5236 K5\uFF0C\u4FDD\u6301\u8F93\u5165\u7A33\u5B9A
3. \u53D1\u4E00\u6B21\u5B8C\u6574 P\u2212 \u8109\u51B2\uFF0C\u518D\u8BFB\u53D6 L5\uFF5EL0 \u7684\u516D\u4F4D\u7ED3\u679C\uFF1BL6 \u5355\u72EC\u6307\u793A\u6EA2\u51FA
4. \u91CD\u590D\u8F93\u5165\u548C\u53D1\u8109\u51B2\uFF0C\u8FDB\u884C\u8FDE\u7EED\u8FD0\u7B97\u3002\u5355\u72EC\u6539\u53D8\u8F93\u5165\u4E0D\u4F1A\u66F4\u65B0\u7D2F\u8BA1\u7ED3\u679C

## \u9A8C\u6536

| \u7B97\u5F0F | \u6BCF\u6B21\u8109\u51B2\u540E\u7684\u7D2F\u8BA1\u7ED3\u679C |
| --- | --- |
| 7\uFF0B5\u22126\uFF0B12 | 00 0111 \u2192 00 1100 \u2192 00 0110 \u2192 **01 0010**\uFF08\u6B63\u6EA2\u51FA\uFF09 |
| \uFF08\u221212\uFF09\uFF0B\uFF08\u22122\uFF09\u22126 | 11 0100 \u2192 11 0010 \u2192 **10 1100**\uFF08\u8D1F\u6EA2\u51FA\uFF09 |

## \u8D70\u7EBF\u4E0E\u7EBF\u8272

\u7EA2\u8272\u4E3A\u7535\u6E90\uFF0C\u6DF1\u7070\u4E3A\u5730\uFF0C\u7EFF\u8272\u4E3A\u6570\u503C\u8F93\u5165\uFF0C\u7D2B\u8272\u4E3A\u52A0\u51CF\u63A7\u5236\u548C\u8FDB\u4F4D\uFF0C\u84DD\u8272\u4E3A\u8BA1\u7B97\u7ED3\u679C\uFF0C\u9EC4\u8272\u4E3A\u5BC4\u5B58\u5668\u53CD\u9988\uFF0C\u9752\u8272\u4E3A LED \u8F93\u51FA\uFF0C\u7C89\u8272\u4E3A\u6E05\u96F6\u548C\u65F6\u949F

\u5BFC\u7EBF\u6CBF\u5206\u5F00\u7684\u901A\u9053\u7ED5\u5F00\u82AF\u7247\u5916\u6846\u3002\u4EA4\u53C9\u5904\u6CA1\u6709\u63A5\u70B9\uFF0C\u53EA\u6709\u5BFC\u7EBF\u4E24\u7AEF\u63D2\u5165\u7684\u5B54\u53C2\u4E0E\u8FDE\u63A5\u3002\u4F60\u53EF\u4EE5\u70B9\u51FB\u5DE6\u4FA7\u201C\u6574\u7406\u8D70\u7EBF\u201D\uFF0C\u786E\u8BA4\u540E\u8C03\u6574\u5F53\u524D\u7535\u8DEF\u7684\u8DEF\u5F84\uFF1B\u82AF\u7247\u4F4D\u7F6E\u3001\u7AEF\u70B9\u3001\u7EBF\u8272\u548C\u5907\u6CE8\u4FDD\u6301\u4E0D\u53D8\uFF0C\u968F\u540E\u53EF\u64A4\u9500

\u91CD\u65B0\u52A0\u8F7D\u6587\u4EF6\u3001\u65AD\u7535\u6216\u64A4\u9500\u540E\uFF0C\u5BC4\u5B58\u5668\u6613\u5931\u72B6\u6001\u4E0D\u4FDD\u7559\uFF0C\u9700\u8981\u518D\u6B21\u6E05\u96F6\u3002\u8FD9\u662F\u7406\u60F3\u6570\u5B57\u903B\u8F91\u6A21\u578B\uFF0C\u4E0D\u6A21\u62DF\u7535\u6D41\u3001\u6309\u952E\u6296\u52A8\u548C\u5B9E\u9645\u4F20\u64AD\u65F6\u5EF6
`;
  function allocatePin(project, usage, name) {
    if (!name.startsWith("U")) {
      return name;
    }
    const parts = name.split("-");
    let chip = null;
    for (const candidate of project.chips) {
      if (candidate.id === parts[0]) {
        chip = candidate;
      }
    }
    const pin = Number(parts[1]);
    const hole = pinHole(chip, pin);
    const position = hole.split(":");
    let rows = "GHIJ";
    if (pin > CHIP_MODELS[chip.model].count / 2) {
      rows = "DCBA";
    }
    let index = 0;
    if (Object.hasOwn(usage, name)) {
      index = usage[name];
    }
    if (index >= rows.length) {
      throw new Error("\u793A\u4F8B\u7535\u8DEF\u7684\u540C\u5217\u7A7A\u5B54\u4E0D\u8DB3");
    }
    usage[name] = index + 1;
    return holeId(chip.section, rows[index], Number(position[2]));
  }
  function connect(project, usage, first, second, color) {
    const from = allocatePin(project, usage, first);
    const to = allocatePin(project, usage, second);
    const number = project.wires.length + 1;
    project.wires.push({ id: "W" + number, from, to, color: WIRE_COLORS[color], bends: [] });
  }
  function complementPreset() {
    const project = emptyProject();
    project.inputCount = 7;
    project.outputCount = 7;
    project.notes = COMPLEMENT_NOTES;
    project.name = "\u53CC\u7B26\u53F7\u4F4D\u8865\u7801\u8FD0\u7B97\u5668";
    project.chips = [
      { id: "U1", model: "74LS273", section: 1, column: 24 },
      { id: "U2", model: "74LS283", section: 2, column: 16 },
      { id: "U3", model: "74LS283", section: 2, column: 39 },
      { id: "U4", model: "74LS86", section: 1, column: 3 },
      { id: "U5", model: "74LS86", section: 1, column: 44 }
    ];
    const usage = {};
    let power = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      const powerPin = chip.id + "-" + model.power;
      const groundPin = chip.id + "-" + model.ground;
      connect(project, usage, power, powerPin, 0);
      connect(project, usage, ground, groundPin, 7);
      power = powerPin;
      ground = groundPin;
    }
    const unusedInputs = ["U1-17", "U1-18", "U3-14", "U3-15", "U3-12", "U3-11", "U5-9", "U5-10", "U5-12", "U5-13"];
    for (const pin of unusedInputs) {
      connect(project, usage, ground, pin, 7);
      ground = pin;
    }
    const inputPins = [1, 4, 9, 12];
    const outputPins = [3, 6, 8, 11];
    const adderPins = [6, 2, 15, 11];
    for (let bit = 0; bit < 4; bit = bit + 1) {
      connect(project, usage, "K" + bit, "U4-" + inputPins[bit], 2);
      connect(project, usage, "U4-" + outputPins[bit], "U2-" + adderPins[bit], 2);
    }
    connect(project, usage, "K4", "U5-1", 2);
    let control = "K5";
    for (const pin of ["U4-2", "U4-5", "U4-10", "U4-13", "U5-2", "U2-7"]) {
      connect(project, usage, control, pin, 4);
      control = pin;
    }
    connect(project, usage, "U5-3", "U3-6", 4);
    connect(project, usage, "U3-6", "U3-2", 4);
    connect(project, usage, "U2-9", "U3-7", 4);
    const sums = [["U2-4", "U1-3"], ["U2-1", "U1-4"], ["U2-13", "U1-7"], ["U2-10", "U1-8"], ["U3-4", "U1-13"], ["U3-1", "U1-14"]];
    for (const pair of sums) {
      connect(project, usage, pair[0], pair[1], 1);
    }
    const feedback = [["U1-2", "U2-5"], ["U1-5", "U2-3"], ["U1-6", "U2-14"], ["U1-9", "U2-12"], ["U1-12", "U3-5"], ["U1-15", "U3-3"]];
    for (const pair of feedback) {
      connect(project, usage, pair[0], pair[1], 3);
    }
    const registerOutputs = [2, 5, 6, 9, 12, 15];
    for (let bit = 0; bit < 6; bit = bit + 1) {
      connect(project, usage, "U1-" + registerOutputs[bit], "L" + bit, 5);
    }
    connect(project, usage, "U1-12", "U5-4", 5);
    connect(project, usage, "U1-15", "U5-5", 5);
    connect(project, usage, "U5-6", "L6", 5);
    connect(project, usage, "K6", "U1-1", 6);
    connect(project, usage, "P-", "U1-11", 6);
    for (const wire of project.wires) {
      if (Object.hasOwn(preset_routes_default, wire.id)) {
        wire.bends = structuredClone(preset_routes_default[wire.id]);
      }
    }
    project.switches[6] = 1;
    return project;
  }
  function restorePresetRoutes(project) {
    const reference = complementPreset();
    if (project.chips.length !== reference.chips.length || project.wires.length !== reference.wires.length) {
      return false;
    }
    for (const expected of reference.chips) {
      let matched = false;
      for (const chip of project.chips) {
        if (chip.id === expected.id && chip.model === expected.model && chip.section === expected.section && chip.column === expected.column) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return false;
      }
    }
    const routes = /* @__PURE__ */ new Map();
    for (const expected of reference.wires) {
      routes.set(expected.id, expected);
    }
    for (const wire of project.wires) {
      const expected = routes.get(wire.id);
      if (!expected || wire.from !== expected.from || wire.to !== expected.to) {
        return false;
      }
    }
    for (const wire of project.wires) {
      wire.bends = structuredClone(routes.get(wire.id).bends);
    }
    return true;
  }

  // src/routing.mjs
  var import_javascript_astar = __toESM(require_astar(), 1);

  // src/geometry.mjs
  var PICK_RADIUS = 7;
  function chipBounds(chip) {
    const count = CHIP_MODELS[chip.model].count;
    const left = BOARD.startX + (chip.column - 1) * BOARD.pitch - 9;
    const top = rowY(chip.section, "E") + 9;
    return { x: left, y: top, width: count / 2 * BOARD.pitch, height: 32 };
  }
  function wirePoints(wire, index) {
    const first = endpointPosition(wire.from);
    const last = endpointPosition(wire.to);
    const points = [first];
    if (wire.bends.length > 0) {
      for (const bend of wire.bends) {
        points.push(bend);
      }
    } else {
      const laneOffset = 12 + index % 9 * 5;
      let lane = (first.y + last.y) / 2 + laneOffset;
      if (Math.abs(first.y - last.y) < 12) {
        lane = first.y - laneOffset;
      }
      points.push({ x: first.x, y: lane });
      points.push({ x: last.x, y: lane });
    }
    points.push(last);
    return points;
  }
  function segmentDistance(point, first, last) {
    const horizontal = last.x - first.x;
    const vertical = last.y - first.y;
    const length = horizontal * horizontal + vertical * vertical;
    if (length === 0) {
      return Math.hypot(point.x - first.x, point.y - first.y);
    }
    let portion = ((point.x - first.x) * horizontal + (point.y - first.y) * vertical) / length;
    portion = Math.max(0, Math.min(1, portion));
    return Math.hypot(point.x - first.x - portion * horizontal, point.y - first.y - portion * vertical);
  }
  function hitCandidates(point, state2, endpoints2) {
    const candidates = [];
    if (point.y >= PORT_LAYOUT.inputY + 17 && point.y <= PORT_LAYOUT.inputY + 60) {
      for (let index = 0; index < IO_LIMIT; index = index + 1) {
        const location = endpointPosition("K" + index);
        if (Math.abs(point.x - location.x) <= 15) {
          return [{ kind: "switch", id: index }];
        }
      }
      for (const name of ["P+", "P-"]) {
        const location = endpointPosition(name);
        if (Math.abs(point.x - location.x) <= 16) {
          return [{ kind: "pulse", id: name }];
        }
      }
    }
    for (let index = state2.project.wires.length - 1; index >= 0; index = index - 1) {
      const wire = state2.project.wires[index];
      const points = wirePoints(wire, index);
      for (let segment = 1; segment < points.length; segment = segment + 1) {
        if (segmentDistance(point, points[segment - 1], points[segment]) < 5) {
          candidates.push({ kind: "wire", id: wire.id });
          break;
        }
      }
    }
    for (const name of endpoints2) {
      const location = endpointPosition(name);
      if (Math.hypot(point.x - location.x, point.y - location.y) <= PICK_RADIUS) {
        candidates.push({ kind: "node", id: name });
      }
    }
    for (const chip of state2.project.chips) {
      const bounds = chipBounds(chip);
      if (point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height) {
        candidates.push({ kind: "chip", id: chip.id });
      }
    }
    return candidates;
  }
  function hitTest(point, state2, endpoints2) {
    const candidates = hitCandidates(point, state2, endpoints2);
    if (candidates.length > 0) {
      return candidates[0];
    }
    return null;
  }
  function objectSelected(state2, kind, id) {
    if (state2.selection && state2.selection.length > 0) {
      for (const target of state2.selection) {
        if (target.kind === kind && target.id === id) {
          return true;
        }
      }
      return false;
    }
    return Boolean(state2.selected && state2.selected.kind === kind && state2.selected.id === id);
  }
  function nearestEndpoint(point, endpoints2) {
    let nearest = "";
    let distance = 14;
    for (const name of endpoints2) {
      const location = endpointPosition(name);
      const current = Math.hypot(point.x - location.x, point.y - location.y);
      if (current < distance) {
        distance = current;
        nearest = name;
      }
    }
    return nearest;
  }
  function wireHandleAt(point, project, selected) {
    if (!selected || selected.kind !== "wire") {
      return null;
    }
    for (let index = 0; index < project.wires.length; index = index + 1) {
      const wire = project.wires[index];
      if (wire.id !== selected.id) {
        continue;
      }
      const points = wirePoints(wire, index);
      for (let handle = 0; handle < points.length; handle = handle + 1) {
        if (Math.hypot(point.x - points[handle].x, point.y - points[handle].y) <= 9) {
          return { wire: wire.id, handle, points };
        }
      }
    }
    return null;
  }

  // src/storage.mjs
  var STORAGE_KEY = "breadboard-lab-v1";
  var LIMITS = { chips: 40, wires: 800, bends: 24, fileBytes: 2e6 };
  function validateProject(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.chips) || !Array.isArray(value.wires) || !Array.isArray(value.switches)) {
      throw new Error("\u6587\u4EF6\u4E0D\u662F\u53D7\u652F\u6301\u7684\u7535\u8DEF\u683C\u5F0F");
    }
    if (value.chips.length > LIMITS.chips || value.wires.length > LIMITS.wires || value.switches.length !== IO_LIMIT) {
      throw new Error("\u7535\u8DEF\u89C4\u6A21\u8D85\u8FC7\u9650\u5236\uFF0C\u6216\u6309\u952E\u6570\u91CF\u4E0D\u6B63\u786E");
    }
    const project = emptyProject();
    if (value.inputCount !== void 0 || value.outputCount !== void 0) {
      if (!Number.isInteger(value.inputCount) || !Number.isInteger(value.outputCount) || value.inputCount < 1 || value.inputCount > IO_LIMIT || value.outputCount < 1 || value.outputCount > IO_LIMIT) {
        throw new Error("\u8F93\u5165\u548C\u8F93\u51FA\u663E\u793A\u4F4D\u6570\u5FC5\u987B\u4E3A 1\uFF5E24");
      }
      project.inputCount = value.inputCount;
      project.outputCount = value.outputCount;
    }
    if (value.mode === "complement") {
      project.inputCount = Math.max(project.inputCount, 7);
      project.outputCount = Math.max(project.outputCount, 7);
    }
    if (value.notes === void 0 && value.mode === "complement") {
      project.notes = COMPLEMENT_NOTES;
    } else if (value.notes !== void 0) {
      if (typeof value.notes !== "string" || value.notes.length > NOTES_LIMIT) {
        throw new Error("\u5907\u6CE8\u5FC5\u987B\u662F\u6587\u5B57\uFF0C\u4E14\u4E0D\u80FD\u8D85\u8FC7 50000 \u4E2A\u5B57\u7B26");
      }
      project.notes = value.notes;
    }
    if (value.pullUps !== void 0) {
      if (!Array.isArray(value.pullUps) || value.pullUps.length > LIMITS.wires) {
        throw new Error("\u4E0A\u62C9\u8282\u70B9\u5217\u8868\u683C\u5F0F\u4E0D\u6B63\u786E");
      }
      const seen = /* @__PURE__ */ new Set();
      for (const endpoint of value.pullUps) {
        if (!validEndpoint(endpoint) || seen.has(endpoint)) {
          throw new Error("\u4E0A\u62C9\u8282\u70B9\u4E0D\u5408\u6CD5\u6216\u91CD\u590D");
        }
        project.pullUps.push(endpoint);
        seen.add(endpoint);
      }
    }
    if (typeof value.name === "string") {
      project.name = value.name.slice(0, 80);
    }
    project.power = value.power === true;
    const identifiers = /* @__PURE__ */ new Set();
    const occupied2 = /* @__PURE__ */ new Set();
    for (const entry of value.chips) {
      if (!entry || typeof entry.id !== "string" || !/^U[1-9][0-9]*$/.test(entry.id) || identifiers.has(entry.id)) {
        throw new Error("\u82AF\u7247\u7F16\u53F7\u4E0D\u5408\u6CD5\u6216\u91CD\u590D");
      }
      const chip = { id: entry.id, model: entry.model, section: entry.section, column: entry.column };
      const error = placementError(project.chips, chip, "");
      if (error !== "") {
        throw new Error(error);
      }
      identifiers.add(chip.id);
      project.chips.push(chip);
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        occupied2.add(pinHole(chip, pin));
      }
    }
    identifiers.clear();
    for (const entry of value.wires) {
      if (!entry || typeof entry.id !== "string" || !/^W[1-9][0-9]*$/.test(entry.id) || identifiers.has(entry.id)) {
        throw new Error("\u5BFC\u7EBF\u7F16\u53F7\u4E0D\u5408\u6CD5\u6216\u91CD\u590D");
      }
      if (!validEndpoint(entry.from) || !validEndpoint(entry.to) || entry.from === entry.to || occupied2.has(entry.from) || occupied2.has(entry.to)) {
        throw new Error("\u5BFC\u7EBF\u7AEF\u70B9\u4E0D\u5408\u6CD5\uFF0C\u6216\u540C\u4E00\u4E2A\u5B54\u88AB\u91CD\u590D\u5360\u7528");
      }
      if (typeof entry.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(entry.color) || !Array.isArray(entry.bends) || entry.bends.length > LIMITS.bends) {
        throw new Error("\u5BFC\u7EBF\u989C\u8272\u6216\u8F6C\u6298\u70B9\u4E0D\u5408\u6CD5");
      }
      const bends = [];
      for (const bend of entry.bends) {
        if (!bend || !Number.isFinite(bend.x) || !Number.isFinite(bend.y) || bend.x < 0 || bend.x > 1300 || bend.y < 0 || bend.y > 1280) {
          throw new Error("\u5BFC\u7EBF\u8F6C\u6298\u70B9\u8D85\u51FA\u9762\u5305\u677F\u8303\u56F4");
        }
        bends.push({ x: bend.x, y: bend.y });
      }
      project.wires.push({ id: entry.id, from: entry.from, to: entry.to, color: entry.color, bends });
      occupied2.add(entry.from);
      occupied2.add(entry.to);
      identifiers.add(entry.id);
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      if (value.switches[index] !== 0 && value.switches[index] !== 1) {
        throw new Error("\u6309\u952E\u72B6\u6001\u5FC5\u987B\u662F 0 \u6216 1");
      }
      project.switches[index] = value.switches[index];
    }
    return project;
  }

  // src/routing.mjs
  var ROUTING = { step: 6, margin: 6, topBoundary: 62, bottomBoundary: 1110, sharedCost: 70, crossingCost: 10, neighborCost: 3, turnCost: 3 };
  var width = Math.floor(BOARD.width / ROUTING.step) + 1;
  var height = Math.floor(BOARD.height / ROUTING.step) + 1;
  function gridPoint(point) {
    return { x: Math.round(point.x / ROUTING.step), y: Math.round(point.y / ROUTING.step) };
  }
  function createWalls(project) {
    const walls = /* @__PURE__ */ new Set();
    for (const chip of project.chips) {
      const bounds = chipBounds(chip);
      for (let column = 0; column < width; column = column + 1) {
        for (let row = 0; row < height; row = row + 1) {
          const horizontal = column * ROUTING.step;
          const vertical = row * ROUTING.step;
          if (horizontal >= bounds.x - ROUTING.margin && horizontal <= bounds.x + bounds.width + ROUTING.margin && vertical >= bounds.y - ROUTING.margin && vertical <= bounds.y + bounds.height + ROUTING.margin) {
            walls.add(column + ":" + row);
          }
        }
      }
    }
    return walls;
  }
  function routeCost(previous) {
    let cost = this.weight;
    const horizontal = this.y === previous.y;
    if (horizontal) {
      cost = cost + this.horizontalUse * ROUTING.sharedCost + this.verticalUse * ROUTING.crossingCost;
    } else {
      cost = cost + this.verticalUse * ROUTING.sharedCost + this.horizontalUse * ROUTING.crossingCost;
    }
    if (previous.parent) {
      const wasHorizontal = previous.y === previous.parent.y;
      if (wasHorizontal !== horizontal) {
        cost = cost + ROUTING.turnCost;
      }
    }
    return cost;
  }
  function createGraph(walls, occupied2, first, last) {
    const weights = [];
    for (let column = 0; column < width; column = column + 1) {
      const cells = [];
      for (let row = 0; row < height; row = row + 1) {
        let weight = 1;
        const key = column + ":" + row;
        const vertical = row * ROUTING.step;
        const top = Math.min(ROUTING.topBoundary, first.y * ROUTING.step, last.y * ROUTING.step);
        const bottom = Math.max(ROUTING.bottomBoundary, first.y * ROUTING.step, last.y * ROUTING.step);
        if (walls.has(key) || column < 4 || column > width - 4 || vertical < top || vertical > bottom) {
          weight = 0;
        }
        cells.push(weight);
      }
      weights.push(cells);
    }
    weights[first.x][first.y] = 1;
    weights[last.x][last.y] = 1;
    const graph = new import_javascript_astar.default.Graph(weights);
    for (let column = 0; column < width; column = column + 1) {
      for (let row = 0; row < height; row = row + 1) {
        const cell = graph.grid[column][row];
        const key = column + ":" + row;
        const usage = occupied2.get(key);
        cell.horizontalUse = 0;
        cell.verticalUse = 0;
        if (usage) {
          cell.horizontalUse = usage.horizontal;
          cell.verticalUse = usage.vertical;
        }
        for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          if (occupied2.has(column + offset[0] + ":" + (row + offset[1])) && cell.weight !== 0) {
            cell.weight = cell.weight + ROUTING.neighborCost;
          }
        }
        cell.getCost = routeCost;
      }
    }
    return graph;
  }
  function markPath(points, occupied2) {
    for (let index = 1; index < points.length; index = index + 1) {
      const first = points[index - 1];
      const last = points[index];
      const horizontal = first.y === last.y;
      for (const point of [first, last]) {
        const key = point.x + ":" + point.y;
        let usage = occupied2.get(key);
        if (!usage) {
          usage = { horizontal: 0, vertical: 0 };
          occupied2.set(key, usage);
        }
        if (horizontal) {
          usage.horizontal = usage.horizontal + 1;
        } else {
          usage.vertical = usage.vertical + 1;
        }
      }
    }
  }
  function simplifyPath(points) {
    const simplified = [];
    for (const point of points) {
      if (simplified.length > 0) {
        const previous = simplified[simplified.length - 1];
        if (previous.x === point.x && previous.y === point.y) {
          continue;
        }
      }
      while (simplified.length >= 2) {
        const previous = simplified[simplified.length - 1];
        const before = simplified[simplified.length - 2];
        const vertical = before.x === previous.x && previous.x === point.x;
        const horizontal = before.y === previous.y && previous.y === point.y;
        if (!vertical && !horizontal) {
          break;
        }
        simplified.pop();
      }
      simplified.push({ x: point.x, y: point.y });
    }
    return simplified;
  }
  function compareLength(first, second) {
    return first.length - second.length;
  }
  function yieldRouting(resolve) {
    setTimeout(resolve, 0);
  }
  async function routeWires(project) {
    const walls = createWalls(project);
    const occupied2 = /* @__PURE__ */ new Map();
    const ordered = [];
    for (const wire of project.wires) {
      const first = endpointPosition(wire.from);
      const last = endpointPosition(wire.to);
      ordered.push({ wire, first, last, length: Math.abs(first.x - last.x) + Math.abs(first.y - last.y) });
    }
    ordered.sort(compareLength);
    const routes = {};
    for (const entry of ordered) {
      const first = gridPoint(entry.first);
      const last = gridPoint(entry.last);
      const graph = createGraph(walls, occupied2, first, last);
      const path = import_javascript_astar.default.astar.search(graph, graph.grid[first.x][first.y], graph.grid[last.x][last.y]);
      if (path.length === 0 && (first.x !== last.x || first.y !== last.y)) {
        throw new Error("\u627E\u4E0D\u5230\u5BFC\u7EBF\u8DEF\u5F84\uFF1A" + entry.wire.id);
      }
      const cells = [first];
      const points = [entry.first, { x: first.x * ROUTING.step, y: entry.first.y }];
      points.push({ x: first.x * ROUTING.step, y: first.y * ROUTING.step });
      for (const cell of path) {
        cells.push({ x: cell.x, y: cell.y });
        points.push({ x: cell.x * ROUTING.step, y: cell.y * ROUTING.step });
      }
      points.push({ x: last.x * ROUTING.step, y: entry.last.y }, entry.last);
      const simplified = simplifyPath(points);
      const bends = simplified.slice(1, -1);
      if (bends.length === 0) {
        bends.push({ x: (entry.first.x + entry.last.x) / 2, y: (entry.first.y + entry.last.y) / 2 });
      }
      if (bends.length > LIMITS.bends) {
        throw new Error("\u5BFC\u7EBF\u8DEF\u5F84\u62D0\u89D2\u8FC7\u591A\uFF1A" + entry.wire.id);
      }
      routes[entry.wire.id] = bends;
      markPath(cells, occupied2);
      await new Promise(yieldRouting);
    }
    return routes;
  }

  // src/render.mjs
  var DRAW = { holeRadius: 3.5, wireWidth: 2.4, chipText: 10 };
  var drawingFont = "";
  function canvasColors() {
    const style = getComputedStyle(document.documentElement);
    const colors = {};
    const names = ["board", "hole", "hole-edge", "chip", "chip-text", "module", "module-text", "metal", "trace", "led-on", "led-off", "unknown", "ink", "muted", "rule", "accent", "paper", "surface", "error", "success"];
    for (const name of names) {
      colors[name] = style.getPropertyValue("--color-" + name).trim();
    }
    drawingFont = style.getPropertyValue("--font-body").trim();
    return colors;
  }
  function rectangle(context, left, top, width2, height2, radius, color) {
    context.beginPath();
    context.roundRect(left, top, width2, height2, radius);
    context.fillStyle = color;
    context.fill();
  }
  function label(context, content, horizontal, vertical, size, color, align) {
    context.font = size + "px " + drawingFont;
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillText(content, horizontal, vertical);
  }
  function polyline(context, points, color, width2) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index = index + 1) {
      context.lineTo(points[index].x, points[index].y);
    }
    context.strokeStyle = color;
    context.lineWidth = width2;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
  }
  function circle(context, horizontal, vertical, radius, color) {
    context.beginPath();
    context.arc(horizontal, vertical, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  }
  function allEndpoints() {
    const endpoints2 = [];
    for (let section = 0; section < BOARD.sections; section = section + 1) {
      for (const row of ROWS) {
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          endpoints2.push(holeId(section, row, column));
        }
      }
      for (const row of BUS_ROWS) {
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          if (busHasHole(column)) {
            endpoints2.push(holeId(section, row, column));
          }
        }
      }
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      endpoints2.push("K" + index);
      endpoints2.push("L" + index);
    }
    for (let index = 0; index < 60; index = index + 1) {
      endpoints2.push("R:GND:" + index);
      endpoints2.push("R:VCC:" + index);
    }
    endpoints2.push("P+", "P-", "GND", "VCC");
    return endpoints2;
  }
  function drawBreadboards(context, state2, colors) {
    for (let section = 0; section < BOARD.sections; section = section + 1) {
      const top = BOARD.startY + section * BOARD.sectionHeight - 30;
      rectangle(context, BOARD.panelLeft, top, BOARD.panelWidth, 234, 7, colors.surface);
      context.strokeStyle = colors.rule;
      context.lineWidth = 1;
      context.strokeRect(43, top + 1, 1130, 232);
      rectangle(context, 64, rowY(section, "E") + 15, 1086, 30, 3, colors.board);
      label(context, String(section + 1), 55, top + 116, 12, colors.muted, "center");
      for (let column = 1; column <= BOARD.columns; column = column + 1) {
        const horizontal = BOARD.startX + (column - 1) * BOARD.pitch;
        if (column === 1 || column % 5 === 0) {
          label(context, String(column), horizontal, top + 3, 9, colors.muted, "center");
        }
        if (state2.visual.internals > 0) {
          context.globalAlpha = state2.visual.internals;
          polyline(context, [{ x: horizontal, y: rowY(section, "A") }, { x: horizontal, y: rowY(section, "E") }], colors.trace, 2);
          polyline(context, [{ x: horizontal, y: rowY(section, "F") }, { x: horizontal, y: rowY(section, "J") }], colors.trace, 2);
          context.globalAlpha = 1;
        }
      }
      for (const row of BUS_ROWS) {
        const vertical = rowY(section, row);
        label(context, row, 74, vertical, 9, colors.muted, "center");
        for (const segment of BUS_SEGMENTS) {
          const first = endpointPosition(holeId(section, row, segment[0]));
          const last = endpointPosition(holeId(section, row, segment[1]));
          context.globalAlpha = 0.25 + state2.visual.internals * 0.75;
          polyline(context, [first, last], colors.accent, 2);
          context.globalAlpha = 1;
        }
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          if (busHasHole(column)) {
            const location = endpointPosition(holeId(section, row, column));
            circle(context, location.x, location.y, DRAW.holeRadius + 1, colors["hole-edge"]);
            circle(context, location.x, location.y, DRAW.holeRadius, colors.hole);
          }
        }
      }
      for (const row of ROWS) {
        label(context, row, 74, rowY(section, row), 9, colors.muted, "center");
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          const location = endpointPosition(holeId(section, row, column));
          circle(context, location.x, location.y, DRAW.holeRadius + 1, colors["hole-edge"]);
          circle(context, location.x, location.y, DRAW.holeRadius, colors.hole);
        }
      }
    }
    polyline(context, [{ x: 1210, y: 85 }, { x: 1210, y: PORT_LAYOUT.inputY + 10 }], colors.hole, 3);
    polyline(context, [{ x: 1242, y: 85 }, { x: 1242, y: PORT_LAYOUT.inputY + 10 }], colors.error, 3);
    label(context, "GND", 1210, 83, 11, colors.ink, "center");
    label(context, "+5V", 1242, 83, 11, colors.error, "center");
    for (let index = 0; index < 60; index = index + 1) {
      for (const name of ["GND", "VCC"]) {
        const location = endpointPosition("R:" + name + ":" + index);
        circle(context, location.x, location.y, 4.4, colors["hole-edge"]);
        circle(context, location.x, location.y, 3.2, colors.hole);
      }
    }
  }
  function drawModules(context, state2, colors) {
    const offset = PORT_LAYOUT.inputY - 1170;
    rectangle(context, BOARD.panelLeft, 14, BOARD.panelWidth, 65, 5, colors.module);
    rectangle(context, BOARD.panelLeft, 1145 + offset, BOARD.panelWidth, 107, 5, colors.module);
    label(context, "\u903B\u8F91\u6307\u793A\u706F", 1122, 35, 12, colors["module-text"], "center");
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      const led = endpointPosition("L" + index);
      const value = readEndpoint(state2.result, "L" + index);
      rectangle(context, led.x - 8, 34, 16, 13, 3, colors["led-off"]);
      context.globalAlpha = state2.visual.leds["L" + index];
      rectangle(context, led.x - 8, 34, 16, 13, 3, colors["led-on"]);
      context.globalAlpha = 1;
      if (value === "X" || value === "Z") {
        label(context, String(value), led.x, 40, 8, colors["module-text"], "center");
      }
      label(context, "L" + index, led.x, 24, 8, colors["module-text"], "center");
      const location = endpointPosition("K" + index);
      label(context, "K" + index, location.x, 1156 + offset, 9, colors["module-text"], "center");
      rectangle(context, location.x - 12, 1190 + offset, 24, 36, 4, colors["chip-text"]);
      const switchTop = 1207 + offset - state2.visual.switches[index] * 14;
      rectangle(context, location.x - 9, switchTop, 18, 15, 2, colors.metal);
      label(context, String(state2.project.switches[index]), location.x, 1237 + offset, 10, colors["module-text"], "center");
      rectangle(context, location.x - 6, 1179 + offset, 12, 6, 2, colors["led-off"]);
      context.globalAlpha = state2.visual.leds["K" + index];
      rectangle(context, location.x - 6, 1179 + offset, 12, 6, 2, colors["led-on"]);
      context.globalAlpha = 1;
    }
    for (const name of ["P+", "P-"]) {
      const location = endpointPosition(name);
      label(context, name, location.x, 1156 + offset, 10, colors["module-text"], "center");
      let buttonColor = colors["chip-text"];
      let buttonY = 1208 + offset;
      if (state2.pressedPulse === name) {
        buttonColor = colors["led-on"];
        buttonY = buttonY + 3;
      }
      circle(context, location.x, buttonY, 14, buttonColor);
      label(context, "\u8109\u51B2", location.x, 1237 + offset, 9, colors["module-text"], "center");
    }
    for (const name of ["GND", "VCC"]) {
      const location = endpointPosition(name);
      circle(context, location.x, location.y, 5, colors.metal);
      label(context, name, location.x, 1195 + offset, 9, colors.ink, "center");
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      for (const prefix of ["K", "L"]) {
        const location = endpointPosition(prefix + index);
        circle(context, location.x, location.y, 4.5, colors.metal);
        circle(context, location.x, location.y, 2.5, colors.hole);
      }
    }
    for (const name of ["P+", "P-"]) {
      const location = endpointPosition(name);
      circle(context, location.x, location.y, 4.5, colors.metal);
      circle(context, location.x, location.y, 2.5, colors.hole);
    }
  }
  function drawChip(context, chip, state2, colors) {
    const bounds = chipBounds(chip);
    const model = CHIP_MODELS[chip.model];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      const location = endpointPosition(pinHole(chip, pin));
      let edge = bounds.y + bounds.height;
      if (pin > model.count / 2) {
        edge = bounds.y;
      }
      polyline(context, [location, { x: location.x, y: edge }], colors.metal, 5);
    }
    rectangle(context, bounds.x, bounds.y, bounds.width, bounds.height, 3, colors.chip);
    circle(context, bounds.x, bounds.y + 16, 6, colors.board);
    label(context, chip.id + "  " + chip.model, bounds.x + bounds.width / 2 + 3, bounds.y + 16, DRAW.chipText, colors["chip-text"], "center");
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      const location = endpointPosition(pinHole(chip, pin));
      let vertical = bounds.y + bounds.height - 3;
      if (pin > model.count / 2) {
        vertical = bounds.y + 4;
      }
      label(context, String(pin), location.x, vertical, 6, colors["chip-text"], "center");
    }
    if (objectSelected(state2, "chip", chip.id)) {
      context.strokeStyle = colors.accent;
      context.lineWidth = 2;
      context.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
    }
  }
  function drawWires(context, state2, colors) {
    for (let index = 0; index < state2.project.wires.length; index = index + 1) {
      const wire = state2.project.wires[index];
      const points = wirePoints(wire, index);
      let width2 = DRAW.wireWidth;
      const selected = objectSelected(state2, "wire", wire.id);
      if (selected) {
        width2 = 5;
      }
      polyline(context, points, colors.surface, width2 + 2);
      polyline(context, points, wire.color, width2);
      const first = points[0];
      const last = points[points.length - 1];
      circle(context, first.x, first.y, 4, wire.color);
      circle(context, last.x, last.y, 4, wire.color);
      if (selected && state2.tool === "select") {
        for (const point of points) {
          rectangle(context, point.x - 5, point.y - 5, 10, 10, 2, colors.surface);
          context.strokeStyle = wire.color;
          context.lineWidth = 2;
          context.strokeRect(point.x - 5, point.y - 5, 10, 10);
        }
      }
    }
    if (state2.pending) {
      const points = [endpointPosition(state2.pending.from)];
      for (const bend of state2.pending.bends) {
        points.push(bend);
      }
      if (state2.pointer) {
        points.push(state2.pointer);
      }
      context.setLineDash([6, 4]);
      polyline(context, points, state2.wireColor, 2.5);
      context.setLineDash([]);
    }
  }
  function drawHighlights(context, state2, endpoints2, colors) {
    let selectedNode = "";
    if (state2.selected && state2.selected.kind === "node") {
      selectedNode = nodeFor(state2.result.topology, state2.selected.id);
    }
    for (const name of endpoints2) {
      const node2 = nodeFor(state2.result.topology, name);
      const location = endpointPosition(name);
      if (selectedNode !== "" && node2 === selectedNode) {
        context.strokeStyle = colors.accent;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(location.x, location.y, 6.2, 0, Math.PI * 2);
        context.stroke();
      }
      if (state2.showLevels) {
        const value = readEndpoint(state2.result, name);
        if (value !== "Z") {
          let color = colors.unknown;
          if (value === 0) {
            color = colors.ink;
          } else if (value === 1) {
            color = colors.success;
          }
          circle(context, location.x, location.y, 3.2, color);
        }
      }
    }
    if (state2.hovered) {
      const location = endpointPosition(state2.hovered);
      context.strokeStyle = colors.accent;
      context.lineWidth = 2;
      context.strokeRect(location.x - 8, location.y - 8, 16, 16);
    }
  }
  function renderBoard(canvas2, state2, endpoints2) {
    const context = canvas2.getContext("2d");
    context.setTransform(2, 0, 0, 2, 0, 0);
    const colors = canvasColors();
    context.clearRect(0, 0, BOARD.width, BOARD.height);
    rectangle(context, 0, 0, BOARD.width, BOARD.height, 8, colors.board);
    drawBreadboards(context, state2, colors);
    drawModules(context, state2, colors);
    for (const chip of state2.project.chips) {
      drawChip(context, chip, state2, colors);
    }
    drawWires(context, state2, colors);
    drawHighlights(context, state2, endpoints2, colors);
    if (state2.placing) {
      label(context, "\u653E\u7F6E " + state2.placing, 650, 1105, 17, colors.accent, "center");
    }
  }

  // node_modules/marked/lib/marked.esm.js
  function j() {
    return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
  }
  var y = j();
  function ie(l2) {
    y = l2;
  }
  var D = { exec: () => null };
  function B(l2) {
    let e = [];
    return (t) => {
      let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
      return s || (s = l2(n), e[n] = s), s;
    };
  }
  function h(l2, e = "") {
    let t = typeof l2 == "string" ? l2 : l2.source, n = { replace: (s, i) => {
      let r = typeof i == "string" ? i : i.source;
      return r = r.replace(T.caret, "$1"), t = t.replace(s, r), n;
    }, getRegex: () => new RegExp(t, e) };
    return n;
  }
  var we = ((l2 = "") => {
    try {
      return !!new RegExp("(?<=1)(?<!1)" + l2);
    } catch {
      return false;
    }
  })();
  var T = { codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm, listInterruptsParagraph: /^ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, endingSpaceTabChar: /[ \t]$/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, leadingSpaceTab: /^[ \t]+/, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, blockquoteMarkerWhitespace: /^( {0,3}>)([ \t]+)/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\][ \t]+\S/, listReplaceTask: /^\[[ xX]\][ \t]+/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/, numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l2) => new RegExp(`^( {0,3}${l2})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: B((l2) => new RegExp(`^ {0,${l2}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: B((l2) => new RegExp(`^ {0,${l2}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)), fencesBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}(?:\`\`\`|~~~)`)), headingBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}#{1,6}(?:\\s|$)`)), pedanticHeadingBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}#`)), htmlBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}(?:</?(?:${K})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")), blockquoteBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}>`)), nestedContainerMarkers: /^(?: {0,3}(?:(?:[*+-]|\d{1,9}[.)])[ \t]+|>[ \t]?))+/ };
  var He = /^(?:[ \t]*(?:\n|$))+/;
  var je = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
  var Ge = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/;
  var W = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
  var Ne = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
  var ae = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
  var Pe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/;
  var ye = h(Pe).replace(/bull/g, ae).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
  var Fe = h(Pe).replace(/bull/g, ae).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
  var le = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
  var Qe = /^[^\n]+/;
  var ue = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/;
  var Ue = h(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", ue).replace("title", /(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex();
  var We = h(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, ae).getRegex();
  var K = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
  var pe = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
  var Ke = h("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", pe).replace("tag", K).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  var Se = (l2) => h(le).replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", l2).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
  var Xe = Se(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
  var Ve = Se(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
  var Je = h(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph", Ve).getRegex();
  var ce = { blockquote: Je, code: je, def: Ue, fences: Ge, heading: Ne, hr: W, html: Ke, lheading: ye, list: We, newline: He, paragraph: Xe, table: D, text: Qe };
  var Re = h("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
  var Ye = { ...ce, lheading: Fe, table: Re, paragraph: h(le).replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Re).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex() };
  var et = { ...ce, html: h(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace("comment", pe).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: D, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: h(le).replace("hr", W).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ye).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
  var tt = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
  var nt = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
  var _e = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
  var rt = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
  var $ = /[\p{P}\p{S}]/u;
  var G = /[\s\p{P}\p{S}]/u;
  var X = /[^\s\p{P}\p{S}]/u;
  var st = h(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, G).getRegex();
  var it = /[\p{Pi}\p{Ps}"']/u;
  var $e = /(?!~)[\p{P}\p{S}]/u;
  var ot = /(?!~)[\s\p{P}\p{S}]/u;
  var at = /(?:[^\s\p{P}\p{S}]|~)/u;
  var lt = h(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", we ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
  var Le = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
  var ut = h(Le, "u").replace(/punct/g, $).getRegex();
  var pt = h(Le, "u").replace(/punct/g, $e).getRegex();
  var ct = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/;
  var ht = h(ct, "u").replace(/openQuote/g, it).replace(/punct/g, $).getRegex();
  var Ce = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
  var dt = h(Ce, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var gt = h(Ce, "gu").replace(/notPunctSpace/g, at).replace(/punctSpace/g, ot).replace(/punct/g, $e).getRegex();
  var kt = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)";
  var ft = h(kt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var mt = h("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var xt = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)";
  var bt = h(xt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var Rt = h(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, $).getRegex();
  var Tt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
  var Ot = h(Tt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var wt = h(/\\(punct)/, "gu").replace(/punct/g, $).getRegex();
  var Pt = h(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, $).getRegex();
  var yt = h(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
  var St = h(pe).replace("(?:-->|$)", "-->").getRegex();
  var _t = h("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", St).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
  var Ie = /\[(?:\\[\s\S]|[^\[\]\\])*\]/;
  var re = h(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", Ie).getRegex();
  var $t = h(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", re).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex();
  var Lt = h(/^!?\[(label)\]\[(ref)\]/).replace("label", re).replace("ref", ue).getRegex();
  var Ct = h(/^!?\[(ref)\](?:\[\])?/).replace("ref", ue).getRegex();
  var Te = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/;
  var It = h(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", Ie).getRegex();
  var At = h("reflink|nolink(?!\\()", "g").replace("reflink", h(/^!?\[(label)\]\[(ref)\]/).replace("label", It).replace("ref", Te).getRegex()).replace("nolink", h(/^!?\[(ref)\](?:\[\])?/).replace("ref", Te).getRegex()).getRegex();
  var Oe = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
  var Et = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/;
  var zt = h(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, Et).getRegex();
  var he = { _backpedal: D, anyPunctuation: wt, anyPunctuationOutsideCode: Pt, autolink: yt, blockSkip: lt, br: _e, code: nt, del: D, delLDelim: D, delRDelim: D, emStrongLDelim: ut, emStrongRDelimAst: dt, emStrongRDelimUnd: mt, escape: tt, link: $t, nolink: Ct, punctuation: st, reflink: Lt, reflinkSearch: At, tag: _t, text: rt, url: D };
  var Mt = { ...he, emStrongLDelim: ht, emStrongRDelimAst: ft, emStrongRDelimUnd: bt, link: h(/^!?\[(label)\]\((.*?)\)/).replace("label", re).getRegex(), reflink: h(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", re).getRegex() };
  var oe = { ...he, emStrongRDelimAst: gt, emStrongLDelim: pt, delLDelim: Rt, delRDelim: Ot, url: h(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", zt).replace("protocol", Oe).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: h(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", Oe).replace(/emailProtocol/g, /(?:mailto|xmpp):/).replace("wwwStart", we ? "(?<![^\\s*_~(])www\\." : "www\\.").getRegex() };
  var Bt = { ...oe, br: h(_e).replace("{2,}", "*").getRegex(), text: h(oe.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
  var V = { normal: ce, gfm: Ye, pedantic: et };
  var N = { normal: he, gfm: oe, breaks: Bt, pedantic: Mt };
  var Dt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var Ae = (l2) => Dt[l2];
  function P(l2, e) {
    if (e) {
      if (T.escapeTest.test(l2)) return l2.replace(T.escapeReplace, Ae);
    } else if (T.escapeTestNoEncode.test(l2)) return l2.replace(T.escapeReplaceNoEncode, Ae);
    return l2;
  }
  function Ee(l2) {
    return T.numericCharacterReference.test(l2) ? l2.replace(T.numericCharacterReferenceOrAmpersand, (e, t, n) => {
      if (t === void 0 && n === void 0) return "&amp;";
      let s = t === void 0 ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
      return s === 0 || s > 1114111 || s >= 55296 && s <= 57343 ? "\uFFFD" : s === 38 ? "&amp;" : String.fromCodePoint(s);
    }) : l2;
  }
  function de(l2) {
    try {
      l2 = encodeURI(l2).replace(T.percentDecode, "%");
    } catch {
      return null;
    }
    return l2;
  }
  function ge(l2, e) {
    let t = l2.replace(T.findPipe, (i, r, o) => {
      let a = false, p = r;
      for (; --p >= 0 && o[p] === "\\"; ) a = !a;
      return a ? "|" : " |";
    }), n = t.split(T.splitPipe), s = 0;
    if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
    else for (; n.length < e; ) n.push("");
    for (; s < n.length; s++) n[s] = n[s].trim().replace(T.slashPipe, "|");
    return n;
  }
  function L(l2, e, t) {
    let n = l2.length;
    if (n === 0) return "";
    let s = 0;
    for (; s < n; ) {
      let i = l2.charAt(n - s - 1);
      if (i === e && !t) s++;
      else if (i !== e && t) s++;
      else break;
    }
    return l2.slice(0, n - s);
  }
  function ke(l2) {
    let e = l2.split(`
`), t = e.length - 1;
    for (; t >= 0 && T.blankLine.test(e[t]); ) t--;
    return e.length - t <= 2 ? l2 : e.slice(0, t + 1).join(`
`);
  }
  function Q(l2) {
    return l2.trim().replace(T.multipleSpaceGlobal, " ").toLowerCase().toUpperCase().toLowerCase();
  }
  function fe(l2, e) {
    if (l2.indexOf(e[0]) === -1 && l2.indexOf(e[1]) === -1) return -1;
    let t = 0;
    for (let n = 0; n < l2.length; n++) if (l2[n] === "\\") n++;
    else if (l2[n] === e[0]) t++;
    else if (l2[n] === e[1] && (t--, t < 0)) return n;
    return t > 0 ? -2 : -1;
  }
  var F = /* @__PURE__ */ new WeakMap();
  function me(l2) {
    let e = { "*": -1, _: -1 }, t = -1, n = l2.length;
    for (let s = 0; s < n; s++) {
      let i = l2[s];
      if (i !== "*" && i !== "_" && i !== "~") continue;
      let r = s === 0 ? `
` : l2[s - 1], o = s + 1;
      for (; o < n && l2[o] === i; ) o++;
      r !== " " && r !== "	" && r !== `
` && r !== "\r" && r !== "\f" && (i === "~" ? t = s : e[i] = s), s = o - 1;
    }
    return { maskedSrc: l2, lastPossibleEmStrongCloserIndex: e, lastPossibleDelCloserIndex: t };
  }
  function ze(l2, e) {
    let t = me(e), n = F.get(l2);
    n ? n.push(t) : F.set(l2, [t]);
  }
  function Me(l2) {
    let e = F.get(l2);
    e && (e.pop(), e.length === 0 && F.delete(l2));
  }
  function Be(l2, e, t) {
    let n = F.get(l2)?.at(-1);
    return n && n.maskedSrc === e ? n.lastPossibleEmStrongCloserIndex[t] : me(e).lastPossibleEmStrongCloserIndex[t];
  }
  function De(l2, e) {
    let t = F.get(l2)?.at(-1);
    return t && t.maskedSrc === e ? t.lastPossibleDelCloserIndex : me(e).lastPossibleDelCloserIndex;
  }
  function J(l2, e = 0) {
    let t = e, n = "";
    for (let s of l2) if (s === "	") {
      let i = 4 - t % 4;
      n += " ".repeat(i), t += i;
    } else n += s, t++;
    return n;
  }
  function qe(l2, e, t, n, s) {
    let i = e.href, r = e.title || null, o = l2[1].replace(s.other.outputLinkReplace, "$1"), a = l2[0].charAt(0) === "!", p = n.state.inLink, c = n.state.linkEmitted, u = n.state.inRawBlock;
    n.state.inLink = true, n.state.linkEmitted = false;
    let d = n.inlineTokens(o), k = n.state.linkEmitted;
    if (n.state.linkEmitted = c, n.state.inLink = p, !a) {
      if (k) {
        n.state.inRawBlock = u;
        return;
      }
      n.state.linkEmitted = true;
    }
    return { type: a ? "image" : "link", raw: t, href: i, title: r, text: o, tokens: d };
  }
  function qt(l2, e, t) {
    let n = l2.match(t.other.indentCodeCompensation);
    if (n === null) return e;
    let s = n[1];
    return e.split(`
`).map((i) => {
      let r = i.match(t.other.beginningSpace);
      if (r === null) return i;
      let [o] = r;
      return i.slice(Math.min(o.length, s.length));
    }).join(`
`);
  }
  function ve(l2, e, t, n) {
    if (!e.includes("<")) return false;
    for (let s = 0; s < e.length; s++) {
      if (e[s] === "\\") {
        s++;
        continue;
      }
      if (e[s] === "`") {
        let o = n.inline.code.exec(e.slice(s));
        if (o) {
          s += o[0].length - 1;
          continue;
        }
      }
      if (e[s] !== "<") continue;
      let i = l2.slice(t + s), r = n.inline.tag.exec(i) || n.inline.autolink.exec(i);
      if (r) {
        if (r[0].length > e.length - s) return true;
        s += r[0].length - 1;
      }
    }
    return false;
  }
  var _ = class {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "rules");
      __publicField(this, "lexer");
      this.options = e || y;
    }
    space(e) {
      let t = this.rules.block.newline.exec(e);
      if (t && t[0].length > 0) return { type: "space", raw: t[0] };
    }
    code(e) {
      let t = this.rules.block.code.exec(e);
      if (t) {
        let n = this.options.pedantic ? t[0] : ke(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
        return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
      }
    }
    fences(e) {
      let t = this.rules.block.fences.exec(e);
      if (t) {
        let n = t[0], s = qt(n, t[3] || "", this.rules);
        return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
      }
    }
    heading(e) {
      let t = this.rules.block.heading.exec(e);
      if (t) {
        let n = t[2].trim();
        if (this.rules.other.endingHash.test(n)) {
          let s = L(n, "#");
          (this.options.pedantic || !s || this.rules.other.endingSpaceTabChar.test(s)) && (n = s.trim());
        }
        return { type: "heading", raw: L(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
      }
    }
    hr(e) {
      let t = this.rules.block.hr.exec(e);
      if (t) return { type: "hr", raw: L(t[0], `
`) };
    }
    blockquote(e) {
      let t = this.rules.block.blockquote.exec(e);
      if (t) {
        let n = L(t[0], `
`).split(`
`), s = "", i = "", r = [];
        for (; n.length > 0; ) {
          let o = false, a = [], p;
          for (p = 0; p < n.length; p++) if (this.rules.other.blockquoteStart.test(n[p])) a.push(n[p]), o = true;
          else if (!o) a.push(n[p]);
          else break;
          n = n.slice(p);
          let c = a.join(`
`), u = c.replace(this.rules.other.blockquoteMarkerWhitespace, (g, b, f) => b + J(f, b.length)).replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
          s = s ? `${s}
${c}` : c, i = i ? `${i}
${u}` : u;
          let d = this.lexer.state.top;
          if (this.lexer.state.top = true, this.lexer.blockTokens(u, r, true), this.lexer.state.top = d, n.length === 0) break;
          let k = r.at(-1);
          if (k?.type === "code" || k?.type === "heading" || k?.type === "hr" || k?.type === "html" || k?.type === "table") break;
          if (k?.type === "blockquote") {
            let g = k, b = n.join(`
`), f = g.raw + `
` + b.replace(this.rules.other.blockquoteSetextReplace2, ""), m = this.blockquote(f);
            r[r.length - 1] = m;
            let S = f.substring(m.raw.length).replace(/^\n/, ""), R = S ? S.split(`
`).length : 0, A = R ? n.slice(0, -R) : n;
            if (A.length > 0 && (s = `${s}
${A.join(`
`)}`), i = i.substring(0, i.length - g.text.length) + m.text, n = n.slice(A.length), n.length > 0 && this.rules.other.blockquoteStart.test(n[0])) continue;
            break;
          } else if (k?.type === "list") {
            let g = k, b = g.raw + `
` + n.join(`
`), f = this.list(b);
            r[r.length - 1] = f;
            let m = f.raw.length > g.raw.length ? b.slice(g.raw.length + 1, f.raw.length).split(`
`).length : 0;
            if (m > 0) {
              let S = n.slice(0, m).join(`
`);
              s = `${s}
${S}`, i = `${i}
${S}`;
            }
            n = n.slice(m);
            continue;
          }
        }
        return { type: "blockquote", raw: s, tokens: r, text: i };
      }
    }
    list(e) {
      let t = this.rules.block.list.exec(e);
      if (t) {
        if (!this.options.pedantic && this.lexer.state.lastToken?.type === "text" && !this.rules.other.listInterruptsParagraph.test(e)) return;
        let n = e, s = () => n.length - e.length, i = t[1].trim(), r = i.length > 1, o = { type: "list", raw: "", ordered: r, start: r ? +i.slice(0, -1) : "", loose: false, items: [] };
        i = r ? `\\d{1,9}\\${i.slice(-1)}` : `\\${i}`, this.options.pedantic && (i = r ? i : "[*+-]");
        let a = this.rules.other.listItemRegex(i), p = false;
        for (; e; ) {
          let u = false, d = "";
          if (!(t = a.exec(e)) || this.rules.block.hr.test(e)) break;
          let k = s();
          e = e.substring(t[0].length);
          let g = t[2].split(`
`, 1)[0], b = t[1].length, f = this.options.pedantic ? J(g, b) : g.replace(this.rules.other.leadingSpaceTab, (v) => J(v, b)), m = e.split(`
`, 1)[0], S = !f.trim(), R = 0;
          if (this.options.pedantic ? (R = 2, d = f.trimStart()) : S ? R = b + 1 : (R = f.search(this.rules.other.nonSpaceChar), R = R > 4 ? 1 : R, d = f.slice(R), R += b), S && this.rules.other.blankLine.test(m) && (e = e.substring(m.length + 1), u = true), !u) {
            let v = this.rules.other.nextBulletRegex(R), U = this.rules.other.hrRegex(R), ee = this.rules.other.fencesBeginRegex(R), te = this.options.pedantic ? this.rules.other.pedanticHeadingBeginRegex(R) : this.rules.other.headingBeginRegex(R), M = this.rules.other.htmlBeginRegex(R), ne = this.rules.other.blockquoteBeginRegex(R), Z = false;
            for (; e; ) {
              let xe = e.split(`
`, 1)[0], H;
              if (m = xe, this.options.pedantic ? (m = m.replace(this.rules.other.listReplaceNesting, "  "), H = m) : H = m.replace(this.rules.other.leadingSpaceTab, (be) => J(be)), ee.test(m) || te.test(m) || M.test(m) || ne.test(m) || v.test(m) || U.test(m)) break;
              if (H.search(this.rules.other.nonSpaceChar) >= R || !m.trim()) d += `
` + H.slice(R), Z = false;
              else {
                if (S || f.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ee.test(f) || te.test(f) || M.test(f) || U.test(f)) break;
                if (!this.options.pedantic && !Z) {
                  let se = f.replace(this.rules.other.nestedContainerMarkers, "");
                  if (this.rules.block.fences.test(se) || this.rules.block.heading.test(se) || this.rules.block.hr.test(se)) break;
                }
                let Ze = !this.options.pedantic && /^ {0,3}(?:=+|-+) *$/.test(m) && this.rules.block.lheading.test(`${f}
${m}`) ? `    ${H.replace(/^ {0,3}/, "")}` : m;
                d += `
` + Ze, Z = true;
              }
              S = !m.trim(), e = e.substring(xe.length + 1), f = H.slice(R);
            }
          }
          let A = n.slice(k, s());
          o.loose || (p ? o.loose = true : this.rules.other.doubleBlankLine.test(A) && (p = true)), o.items.push({ type: "list_item", raw: A, task: !!this.options.gfm && this.rules.other.listIsTask.test(d), loose: false, text: d, tokens: [] });
        }
        let c = o.items.at(-1);
        if (c) c.raw = c.raw.trimEnd(), c.text = c.text.trimEnd();
        else return;
        o.raw = n.slice(0, s()).trimEnd();
        for (let u of o.items) if (this.lexer.state.top = false, u.tokens = this.lexer.blockTokens(u.text, []), !o.loose) {
          let d = u.tokens.filter((g) => g.type === "space"), k = d.length > 0 && d.some((g) => this.rules.other.anyLine.test(g.raw));
          o.loose = k;
        }
        for (let u of o.items) {
          let d = u.tokens[0];
          if (u.task && (d?.type === "text" || d?.type === "paragraph")) {
            u.text = u.text.replace(this.rules.other.listReplaceTask, ""), d.raw = d.raw.replace(this.rules.other.listReplaceTask, ""), d.text = d.text.replace(this.rules.other.listReplaceTask, "");
            for (let g = this.lexer.inlineQueue.length - 1; g >= 0; g--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[g].src)) {
              this.lexer.inlineQueue[g].src = this.lexer.inlineQueue[g].src.replace(this.rules.other.listReplaceTask, "");
              break;
            }
            let k = this.rules.other.listTaskCheckbox.exec(u.raw);
            if (k) {
              let g = { type: "checkbox", raw: k[0] + " ", checked: k[0] !== "[ ]" };
              u.checked = g.checked, o.loose ? u.tokens[0] && ["paragraph", "text"].includes(u.tokens[0].type) && "tokens" in u.tokens[0] && u.tokens[0].tokens ? (u.tokens[0].raw = g.raw + u.tokens[0].raw, u.tokens[0].text = g.raw + u.tokens[0].text, u.tokens[0].tokens.unshift(g)) : u.tokens.unshift({ type: "paragraph", raw: g.raw, text: g.raw, tokens: [g] }) : u.tokens.unshift(g);
            }
          } else u.task && (u.task = false);
        }
        if (o.loose) for (let u of o.items) {
          u.loose = true;
          for (let d of u.tokens) d.type === "text" && (d.type = "paragraph");
        }
        return o;
      }
    }
    html(e) {
      let t = this.rules.block.html.exec(e);
      if (t) {
        let n = ke(t[0]);
        return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
      }
    }
    def(e) {
      let t = this.rules.block.def.exec(e);
      if (t) {
        if (!this.rules.other.startAngleBracket.test(t[2]) && fe(t[2], "()") !== -1) return;
        let n = Q(t[1]), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
        return { type: "def", tag: n, raw: L(t[0], `
`), href: s, title: i };
      }
    }
    table(e) {
      let t = this.rules.block.table.exec(e);
      if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
      let n = ge(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], r = { type: "table", raw: L(t[0], `
`), header: [], align: [], rows: [] };
      if (n.length === s.length) {
        for (let o of s) this.rules.other.tableAlignRight.test(o) ? r.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? r.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? r.align.push("left") : r.align.push(null);
        for (let o = 0; o < n.length; o++) r.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: true, align: r.align[o] });
        for (let o of i) r.rows.push(ge(o, r.header.length).map((a, p) => ({ text: a, tokens: this.lexer.inline(a), header: false, align: r.align[p] })));
        return r;
      }
    }
    lheading(e) {
      let t = this.rules.block.lheading.exec(e);
      if (t) {
        let n = t[1].trim();
        return { type: "heading", raw: L(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
      }
    }
    paragraph(e) {
      let t = this.rules.block.paragraph.exec(e);
      if (t) {
        let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
        return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
      }
    }
    text(e) {
      let t = this.rules.block.text.exec(e);
      if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
    }
    escape(e) {
      let t = this.rules.inline.escape.exec(e);
      if (t) return { type: "escape", raw: t[0], text: t[1] };
    }
    tag(e) {
      let t = this.rules.inline.tag.exec(e);
      if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
    }
    link(e) {
      if (this.lexer.state.linkParenPossible === false) return;
      let t = this.rules.inline.link.exec(e);
      if (t) {
        let n = t[0].charAt(0) === "!" ? 2 : 1;
        if (!this.options.pedantic && ve(e, t[1], n, this.rules)) return;
        let s = t[2].trim();
        if (!this.options.pedantic && this.rules.other.startAngleBracket.test(s)) {
          if (!this.rules.other.endAngleBracket.test(s)) return;
          let a = L(s.slice(0, -1), "\\");
          if ((s.length - a.length) % 2 === 0) return;
        } else {
          let a = fe(t[2], "()");
          if (a === -2) return;
          if (a > -1) {
            let c = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + a;
            t[2] = t[2].substring(0, a), t[0] = t[0].substring(0, c).trim(), t[3] = "";
          }
        }
        let i = L(t[0].slice(0, -1), "\\");
        if ((t[0].length - i.length) % 2 === 0) return;
        let r = t[2], o = "";
        if (this.options.pedantic) {
          let a = this.rules.other.pedanticHrefTitle.exec(r);
          a && (r = a[1], o = a[3]);
        } else o = t[3] ? t[3].slice(1, -1) : "";
        return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(s) ? r = r.slice(1) : r = r.slice(1, -1)), qe(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: o && o.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
      }
    }
    reflink(e, t) {
      let n;
      if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
        let s = n[0].charAt(0) === "!" ? 2 : 1;
        if (!this.options.pedantic && ve(e, n[1], s, this.rules)) return;
        let i = t[Q(n[2] || n[1])];
        if (!i) {
          let r = n[0].charAt(0);
          return { type: "text", raw: r, text: r };
        }
        return qe(n, i, n[0], this.lexer, this.rules);
      }
    }
    emStrong(e, t, n = "") {
      let s = this.rules.inline.emStrongLDelim.exec(e);
      if (!s || !s[1] && !s[2] && !s[3] && !s[4]) return;
      let i = s[0][0], r = n === i, o = t.length - e.length, a = o;
      for (; !this.options.pedantic && a > 0 && t[a - 1] === i; ) a--;
      let p = [...t.slice(Math.max(0, a - 2), a)].at(-1) ?? "", c = p === "*" || p === "_" || !!this.rules.inline.punctuation.exec(p);
      a < o && (n = p);
      let u = a < o ? c : n === "*" || n === "_" || !!this.rules.inline.punctuation.exec(n);
      if (s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
      let d = s[1] || s[3] || "";
      if (!d || !n || u) {
        let k = [...s[0]].length - 1, g, b, f = k, m = 0, S = o - a + k, R = !this.options.pedantic && !!p.trim() && (!!d || i === "*" && !c);
        if (i !== "*" && i !== "_") return;
        let A = i === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd, v = Be(this, t, i), U = t.length - e.length + k;
        if (v < U) return;
        t = t.slice(-1 * e.length + k);
        let ee = v - U;
        for (A.lastIndex = 0; (s = A.exec(t)) !== null && !(s.index > ee); ) {
          if (g = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !g) continue;
          if (b = [...g].length, s[3] || s[4]) {
            f += b;
            continue;
          } else if (s[5] || s[6] || R) {
            if (r && (s[5] || s[6])) break;
            if (S % 3 && !((S + b) % 3)) {
              m += b;
              continue;
            }
          }
          if (f -= b, f > 0) continue;
          b = Math.min(b, b + f + m);
          let te = [...s[0]][0].length, M = e.slice(0, k + s.index + te + b);
          if (Math.min(k, b) % 2) {
            let Z = M.slice(1, -1);
            return { type: "em", raw: M, text: Z, tokens: this.lexer.inlineTokens(Z) };
          }
          let ne = M.slice(2, -2);
          return { type: "strong", raw: M, text: ne, tokens: this.lexer.inlineTokens(ne) };
        }
      }
    }
    codespan(e) {
      let t = this.rules.inline.code.exec(e);
      if (t) {
        let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
        return s && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
      }
    }
    br(e) {
      let t = this.rules.inline.br.exec(e);
      if (t) return { type: "br", raw: t[0] };
    }
    del(e, t, n = "") {
      let s = this.rules.inline.delLDelim.exec(e);
      if (!s) return;
      if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
        let r = [...s[0]].length - 1, o, a, p = r, c = this.rules.inline.delRDelim, u = De(this, t), d = t.length - e.length + r;
        if (u < d) return;
        t = t.slice(-1 * e.length + r);
        let k = u - d;
        for (c.lastIndex = 0; (s = c.exec(t)) !== null && !(s.index > k); ) {
          if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (a = [...o].length, a !== r)) continue;
          if (s[3] || s[4]) {
            p += a;
            continue;
          }
          if (p -= a, p > 0) continue;
          a = Math.min(a, a + p);
          let g = [...s[0]][0].length, b = e.slice(0, r + s.index + g + a), f = b.slice(r, -r);
          return { type: "del", raw: b, text: f, tokens: this.lexer.inlineTokens(f) };
        }
      }
    }
    autolink(e) {
      let t = this.rules.inline.autolink.exec(e);
      if (t) {
        let n, s;
        return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
      }
    }
    url(e) {
      let t;
      if (t = this.rules.inline.url.exec(e)) {
        let n, s;
        if (t[2] === "@") n = t[0], s = "mailto:" + n;
        else {
          let i;
          do
            i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
          while (i !== t[0]);
          n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
        }
        return { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
      }
    }
    inlineText(e) {
      let t = this.rules.inline.text.exec(e);
      if (t) {
        let n = this.lexer.state.inRawBlock;
        return { type: "text", raw: t[0], text: n ? t[0] : Ee(t[0]), escaped: n };
      }
    }
  };
  var _l_instances, e_fn, t_fn, n_fn, r_fn, _a;
  var O = (_a = class {
    constructor(e) {
      __privateAdd(this, _l_instances);
      __publicField(this, "tokens");
      __publicField(this, "options");
      __publicField(this, "state");
      __publicField(this, "inlineQueue");
      __publicField(this, "tokenizer");
      this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || y, this.options.tokenizer = this.options.tokenizer || new _(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, linkEmitted: false, linkParenPossible: true, top: true };
      let t = { other: T, block: V.normal, inline: N.normal };
      this.options.pedantic ? (t.block = V.pedantic, t.inline = N.pedantic) : this.options.gfm && (t.block = V.gfm, this.options.breaks ? t.inline = N.breaks : t.inline = N.gfm), this.tokenizer.rules = t;
    }
    static get rules() {
      return { block: V, inline: N };
    }
    static lex(e, t) {
      return new _a(t).lex(e);
    }
    static lexInline(e, t) {
      return new _a(t).inlineTokens(e);
    }
    lex(e) {
      e = e.replace(T.carriageReturn, `
`), this.blockTokens(e, this.tokens);
      for (let t = 0; t < this.inlineQueue.length; t++) {
        let n = this.inlineQueue[t];
        this.state.inRawBlock = false, this.inlineTokens(n.src, n.tokens);
      }
      return this.inlineQueue = [], this.tokens;
    }
    blockTokens(e, t = [], n = false) {
      this.tokenizer.lexer = this;
      let s = this.state.lastToken;
      this.options.pedantic && (e = e.replace(T.tabCharGlobal, "    ").replace(T.spaceLine, ""));
      let i = 1 / 0;
      for (; e; ) {
        if (e.length < i) i = e.length;
        else {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
        this.state.lastToken = t.at(-1);
        let r;
        if (this.options.extensions?.block?.some((a) => (r = a.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
        if (r = this.tokenizer.space(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          r.raw.length === 1 && a !== void 0 ? a.raw += `
` : t.push(r);
          continue;
        }
        if (r = this.tokenizer.code(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          a?.type === "paragraph" || a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.text, this.inlineQueue.at(-1).src = a.text) : t.push(r);
          continue;
        }
        if (r = this.tokenizer.fences(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.heading(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.hr(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.blockquote(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.list(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.html(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.def(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          a?.type === "paragraph" || a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.raw, this.inlineQueue.at(-1).src = a.text) : (this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }), t.push(r));
          continue;
        }
        if (r = this.tokenizer.table(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.lheading(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        let o = e;
        if (this.options.extensions?.startBlock) {
          let a = 1 / 0, p = e.slice(1), c;
          this.options.extensions.startBlock.forEach((u) => {
            c = u.call({ lexer: this }, p), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
          }), a < 1 / 0 && a >= 0 && (o = e.substring(0, a + 1));
        }
        if (this.state.top && (r = this.tokenizer.paragraph(o))) {
          let a = t.at(-1);
          n && a?.type === "paragraph" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = a.text) : t.push(r), n = o.length !== e.length, e = e.substring(r.raw.length);
          continue;
        }
        if (r = this.tokenizer.text(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = a.text) : t.push(r);
          continue;
        }
        if (e) {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
      }
      return this.state.top = true, this.state.lastToken = s, t;
    }
    inline(e, t = []) {
      return this.inlineQueue.push({ src: e, tokens: t }), t;
    }
    linkInText(e) {
      if (!e.includes("[")) return false;
      let t = this.tokenizer.rules.inline.link;
      for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return true;
      for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
        let s = n[0], i = s.lastIndexOf("[");
        if (!(s.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, Q(s.slice(i + 1, -1)))) && !(i > 1 && this.linkInText(s.slice(1, i - 1)))) return true;
      }
      return false;
    }
    inlineTokens(e, t = []) {
      this.tokenizer.lexer = this;
      let n = this.state.linkParenPossible;
      this.state.linkParenPossible = n && e.includes(")");
      try {
        return __privateMethod(this, _l_instances, e_fn).call(this, e, t);
      } finally {
        this.state.linkParenPossible = n;
      }
    }
    infiniteLoopError(e) {
      let t = "Infinite loop on byte: " + e;
      if (this.options.silent) console.error(t);
      else throw new Error(t);
    }
  }, _l_instances = new WeakSet(), e_fn = function(e, t) {
    let n = e.includes("*") || e.includes("_") || e.includes("~") || this.options.hooks?.emStrongMask || this.tokenizer.emStrong !== _.prototype.emStrong || this.tokenizer.del !== _.prototype.del ? __privateMethod(this, _l_instances, r_fn).call(this, e) : e;
    ze(this.tokenizer, n);
    try {
      return __privateMethod(this, _l_instances, t_fn).call(this, e, n, t);
    } finally {
      Me(this.tokenizer);
    }
  }, t_fn = function(e, t, n) {
    let s = false, i = "", r = 1 / 0;
    for (; e; ) {
      if (e.length < r) r = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (i = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((p) => (o = p.call({ lexer: this }, e, n)) ? (e = e.substring(o.raw.length), n.push(o), true) : false)) continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let p = n.at(-1);
        o.type === "text" && p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : n.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, t, i)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, t, i)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      let a = e;
      if (this.options.extensions?.startInline) {
        let p = 1 / 0, c = e.slice(1), u;
        this.options.extensions.startInline.forEach((d) => {
          u = d.call({ lexer: this }, c), typeof u == "number" && u >= 0 && (p = Math.min(p, u));
        }), p < 1 / 0 && p >= 0 && (a = e.substring(0, p + 1));
      }
      if (o = this.tokenizer.inlineText(a)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (i = o.raw.slice(-1)), s = true;
        let p = n.at(-1);
        p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : n.push(o);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return n;
  }, n_fn = function(e) {
    let { blockSkip: t, tag: n, autolink: s } = this.tokenizer.rules.inline, i = "", r = 0, o;
    for (t.lastIndex = 0; o = t.exec(e); ) {
      let a = o.index + (o[2] ? o[2].length : 0), p = o.index + o[0].length;
      if (e.charAt(a) === "<") {
        let c = e.slice(a), u = n.exec(c) || s.exec(c);
        if (!u) {
          t.lastIndex = a + 1;
          continue;
        }
        p = a + u[0].length, t.lastIndex = p;
      }
      i += e.slice(r, a) + "[" + "a".repeat(p - a - 2) + "]", r = p;
    }
    return i + e.slice(r);
  }, r_fn = function(e) {
    let t = e;
    if (this.tokens.links && e.includes("[")) {
      let n = this.tokenizer.rules.inline.reflinkSearch, s = (i) => {
        let r = i.lastIndexOf("[");
        if (!Object.hasOwn(this.tokens.links, Q(i.slice(r + 1, -1)))) return i;
        if (r > 1 && i.charAt(0) !== "!") {
          let o = i.slice(1, r - 1);
          if (this.linkInText(o)) return "[" + o.replace(n, s) + "][" + "a".repeat(i.length - r - 2) + "]";
        }
        return "[" + "a".repeat(i.length - 2) + "]";
      };
      t = t.replace(n, s);
    }
    return t = t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (n, s, i) => i ? "+".repeat(n.length) : s ? s + n.slice(s.length, -s.length).replace(/`/g, "+") + s : n), t = __privateMethod(this, _l_instances, n_fn).call(this, t), t = this.options.hooks?.emStrongMask?.call({ lexer: this }, t) ?? t, t;
  }, _a);
  var C = class {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "parser");
      this.options = e || y;
    }
    space(e) {
      return "";
    }
    code({ text: e, lang: t, escaped: n }) {
      let s = (t || "").match(T.notSpaceStart)?.[0], i = e ? e.replace(T.endingNewline, "") + `
` : "";
      return s ? '<pre><code class="language-' + P(s) + '">' + (n ? i : P(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : P(i, true)) + `</code></pre>
`;
    }
    blockquote({ tokens: e }) {
      return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
    }
    html({ text: e }) {
      return e;
    }
    def(e) {
      return "";
    }
    heading({ tokens: e, depth: t }) {
      return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
    }
    hr(e) {
      return `<hr>
`;
    }
    list(e) {
      let t = e.ordered, n = e.start, s = "";
      for (let o = 0; o < e.items.length; o++) {
        let a = e.items[o];
        s += this.listitem(a);
      }
      let i = t ? "ol" : "ul", r = t && n !== 1 ? ' start="' + n + '"' : "";
      return "<" + i + r + `>
` + s + "</" + i + `>
`;
    }
    listitem(e) {
      return `<li>${this.parser.parse(e.tokens)}</li>
`;
    }
    checkbox({ checked: e }) {
      return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
    }
    paragraph({ tokens: e }) {
      return `<p>${this.parser.parseInline(e)}</p>
`;
    }
    table(e) {
      let t = "", n = "";
      for (let i = 0; i < e.header.length; i++) n += this.tablecell(e.header[i]);
      t += this.tablerow({ text: n });
      let s = "";
      for (let i = 0; i < e.rows.length; i++) {
        let r = e.rows[i];
        n = "";
        for (let o = 0; o < r.length; o++) n += this.tablecell(r[o]);
        s += this.tablerow({ text: n });
      }
      return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
    }
    tablerow({ text: e }) {
      return `<tr>
${e}</tr>
`;
    }
    tablecell(e) {
      let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
      return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
    }
    strong({ tokens: e }) {
      return `<strong>${this.parser.parseInline(e)}</strong>`;
    }
    em({ tokens: e }) {
      return `<em>${this.parser.parseInline(e)}</em>`;
    }
    codespan({ text: e }) {
      return `<code>${P(e, true)}</code>`;
    }
    br(e) {
      return "<br>";
    }
    del({ tokens: e }) {
      return `<del>${this.parser.parseInline(e)}</del>`;
    }
    link({ href: e, title: t, text: n, tokens: s, autolink: i }) {
      let r = i ? P(n, true) : this.parser.parseInline(s), o = de(e);
      if (o === null) return r;
      e = P(o, i);
      let a = '<a href="' + e + '"';
      return t && (a += ' title="' + P(t) + '"'), a += ">" + r + "</a>", a;
    }
    image({ href: e, title: t, text: n, tokens: s }) {
      s && (n = this.parser.parseInline(s, this.parser.textRenderer));
      let i = de(e);
      if (i === null) return P(n);
      e = i;
      let r = `<img src="${P(e)}" alt="${P(n)}"`;
      return t && (r += ` title="${P(t)}"`), r += ">", r;
    }
    text(e) {
      return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : P(e.text);
    }
  };
  var E = class {
    constructor() {
      __publicField(this, "parser");
    }
    strong({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    em({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    codespan({ text: e }) {
      return e;
    }
    del({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    html({ text: e }) {
      return e;
    }
    text({ text: e }) {
      return e;
    }
    link({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    image({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    br() {
      return `
`;
    }
    checkbox({ raw: e }) {
      return e;
    }
  };
  var w = class l {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "renderer");
      __publicField(this, "textRenderer");
      this.options = e || y, this.options.renderer = this.options.renderer || new C(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new E(), this.textRenderer.parser = this;
    }
    static parse(e, t) {
      return new l(t).parse(e);
    }
    static parseInline(e, t) {
      return new l(t).parseInline(e);
    }
    parse(e) {
      this.renderer.parser = this;
      let t = "";
      for (let n = 0; n < e.length; n++) {
        let s = e[n];
        if (this.options.extensions?.renderers?.[s.type]) {
          let r = s, o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
          if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(r.type)) {
            t += o === false ? "" : o ?? "";
            continue;
          }
        }
        let i = s;
        switch (i.type) {
          case "space": {
            t += this.renderer.space(i);
            break;
          }
          case "hr": {
            t += this.renderer.hr(i);
            break;
          }
          case "heading": {
            t += this.renderer.heading(i);
            break;
          }
          case "code": {
            t += this.renderer.code(i);
            break;
          }
          case "table": {
            t += this.renderer.table(i);
            break;
          }
          case "blockquote": {
            t += this.renderer.blockquote(i);
            break;
          }
          case "list": {
            t += this.renderer.list(i);
            break;
          }
          case "checkbox": {
            t += this.renderer.checkbox(i);
            break;
          }
          case "html": {
            t += this.renderer.html(i);
            break;
          }
          case "def": {
            t += this.renderer.def(i);
            break;
          }
          case "paragraph": {
            t += this.renderer.paragraph(i);
            break;
          }
          case "text": {
            t += this.renderer.text(i);
            break;
          }
          default: {
            let r = 'Token with "' + i.type + '" type was not found.';
            if (this.options.silent) return console.error(r), "";
            throw new Error(r);
          }
        }
      }
      return t;
    }
    parseInline(e, t = this.renderer) {
      this.renderer.parser = this;
      let n = "";
      for (let s = 0; s < e.length; s++) {
        let i = e[s];
        if (this.options.extensions?.renderers?.[i.type]) {
          let o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
          if (o !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
            n += o === false ? "" : o ?? "";
            continue;
          }
        }
        let r = i;
        switch (r.type) {
          case "escape": {
            n += t.text(r);
            break;
          }
          case "html": {
            n += t.html(r);
            break;
          }
          case "link": {
            n += t.link(r);
            break;
          }
          case "image": {
            n += t.image(r);
            break;
          }
          case "checkbox": {
            n += t.checkbox(r);
            break;
          }
          case "strong": {
            n += t.strong(r);
            break;
          }
          case "em": {
            n += t.em(r);
            break;
          }
          case "codespan": {
            n += t.codespan(r);
            break;
          }
          case "br": {
            n += t.br(r);
            break;
          }
          case "del": {
            n += t.del(r);
            break;
          }
          case "text": {
            n += t.text(r);
            break;
          }
          default: {
            let o = 'Token with "' + r.type + '" type was not found.';
            if (this.options.silent) return console.error(o), "";
            throw new Error(o);
          }
        }
      }
      return n;
    }
  };
  var _a2;
  var I = (_a2 = class {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "block");
      this.options = e || y;
    }
    preprocess(e) {
      return e;
    }
    postprocess(e) {
      return e;
    }
    processAllTokens(e) {
      return e;
    }
    emStrongMask(e) {
      return e;
    }
    provideLexer(e = this.block) {
      return e ? O.lex : O.lexInline;
    }
    provideParser(e = this.block) {
      return e ? w.parse : w.parseInline;
    }
  }, __publicField(_a2, "passThroughHooks", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"])), __publicField(_a2, "passThroughHooksRespectAsync", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"])), _a2);
  function z(l2, e) {
    if (Array.isArray(e)) for (let t = 0; t < e.length; t++) l2.push(e[t]);
    else l2.push(e);
  }
  var Y = class {
    constructor(...e) {
      __publicField(this, "defaults", j());
      __publicField(this, "options", this.setOptions);
      __publicField(this, "parse", this.parseMarkdown(true));
      __publicField(this, "parseInline", this.parseMarkdown(false));
      __publicField(this, "Parser", w);
      __publicField(this, "Renderer", C);
      __publicField(this, "TextRenderer", E);
      __publicField(this, "Lexer", O);
      __publicField(this, "Tokenizer", _);
      __publicField(this, "Hooks", I);
      this.use(...e);
    }
    walkTokens(e, t) {
      let n = [];
      for (let s of e) switch (z(n, t.call(this, s)), s.type) {
        case "table": {
          let i = s;
          for (let r of i.header) z(n, this.walkTokens(r.tokens, t));
          for (let r of i.rows) for (let o of r) z(n, this.walkTokens(o.tokens, t));
          break;
        }
        case "list": {
          let i = s;
          z(n, this.walkTokens(i.items, t));
          break;
        }
        default: {
          let i = s;
          this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((r) => {
            let o = i[r].flat(1 / 0);
            z(n, this.walkTokens(o, t));
          }) : i.tokens && z(n, this.walkTokens(i.tokens, t));
        }
      }
      return n;
    }
    use(...e) {
      let t = this.defaults.extensions || { renderers: /* @__PURE__ */ Object.create(null), childTokens: /* @__PURE__ */ Object.create(null) };
      return e.forEach((n) => {
        let s = { ...n };
        if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((i) => {
          if (!i.name) throw new Error("extension name required");
          if ("renderer" in i) {
            let r = t.renderers[i.name];
            r ? t.renderers[i.name] = function(...o) {
              let a = i.renderer.apply(this, o);
              return a === false && (a = r.apply(this, o)), a;
            } : t.renderers[i.name] = i.renderer;
          }
          if ("tokenizer" in i) {
            if (!i.level || i.level !== "block" && i.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
            let r = t[i.level];
            r ? r.unshift(i.tokenizer) : t[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [i.start] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [i.start]));
          }
          "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
        }), s.extensions = t), n.renderer) {
          let i = this.defaults.renderer || new C(this.defaults);
          for (let r in n.renderer) {
            if (!(r in i)) throw new Error(`renderer '${r}' does not exist`);
            if (["options", "parser"].includes(r)) continue;
            let o = r, a = n.renderer[o], p = i[o];
            i[o] = (...c) => {
              let u = a.apply(i, c);
              return u === false && (u = p.apply(i, c)), u === false ? "" : u ?? "";
            };
          }
          s.renderer = i;
        }
        if (n.tokenizer) {
          let i = this.defaults.tokenizer || new _(this.defaults);
          for (let r in n.tokenizer) {
            if (!(r in i)) throw new Error(`tokenizer '${r}' does not exist`);
            if (["options", "rules", "lexer"].includes(r)) continue;
            let o = r, a = n.tokenizer[o], p = i[o];
            i[o] = (...c) => {
              let u = a.apply(i, c);
              return u === false && (u = p.apply(i, c)), u;
            };
          }
          s.tokenizer = i;
        }
        if (n.hooks) {
          let i = this.defaults.hooks || new I();
          for (let r in n.hooks) {
            if (!(r in i)) throw new Error(`hook '${r}' does not exist`);
            if (["options", "block"].includes(r)) continue;
            let o = r, a = n.hooks[o], p = i[o];
            I.passThroughHooks.has(r) ? i[o] = (c) => {
              if (i.options.async && I.passThroughHooksRespectAsync.has(r)) return (async () => {
                let d = await a.call(i, c);
                return p.call(i, d);
              })();
              let u = a.call(i, c);
              return p.call(i, u);
            } : i[o] = (...c) => {
              if (i.options.async) return (async () => {
                let d = await a.apply(i, c);
                return d === false && (d = await p.apply(i, c)), d;
              })();
              let u = a.apply(i, c);
              return u === false && (u = p.apply(i, c)), u;
            };
          }
          s.hooks = i;
        }
        if (n.walkTokens) {
          let i = this.defaults.walkTokens, r = n.walkTokens;
          s.walkTokens = function(o) {
            let a = [];
            return z(a, r.call(this, o)), i && z(a, i.call(this, o)), a;
          };
        }
        this.defaults = { ...this.defaults, ...s };
      }), this;
    }
    setOptions(e) {
      return this.defaults = { ...this.defaults, ...e }, this;
    }
    lexer(e, t) {
      return O.lex(e, t ?? this.defaults);
    }
    parser(e, t) {
      return w.parse(e, t ?? this.defaults);
    }
    parseMarkdown(e) {
      return (n, s) => {
        let i = { ...s }, r = { ...this.defaults, ...i }, o = this.onError(!!r.silent, !!r.async);
        if (this.defaults.async === true && i.async === false) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
        if (typeof n > "u" || n === null) return o(new Error("marked(): input parameter is undefined or null"));
        if (typeof n != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
        if (r.hooks && (r.hooks.options = r, r.hooks.block = e), r.async) return (async () => {
          let a = r.hooks ? await r.hooks.preprocess(n) : n, c = await (r.hooks ? await r.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(a, r), u = r.hooks ? await r.hooks.processAllTokens(c) : c;
          r.walkTokens && await Promise.all(this.walkTokens(u, r.walkTokens));
          let k = await (r.hooks ? await r.hooks.provideParser(e) : e ? w.parse : w.parseInline)(u, r);
          return r.hooks ? await r.hooks.postprocess(k) : k;
        })().catch(o);
        try {
          r.hooks && (n = r.hooks.preprocess(n));
          let p = (r.hooks ? r.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(n, r);
          r.hooks && (p = r.hooks.processAllTokens(p)), r.walkTokens && this.walkTokens(p, r.walkTokens);
          let u = (r.hooks ? r.hooks.provideParser(e) : e ? w.parse : w.parseInline)(p, r);
          return r.hooks && (u = r.hooks.postprocess(u)), u;
        } catch (a) {
          return o(a);
        }
      };
    }
    onError(e, t) {
      return (n) => {
        if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
          let s = "<p>An error occurred:</p><pre>" + P(n.message + "", true) + "</pre>";
          return t ? Promise.resolve(s) : s;
        }
        if (t) return Promise.reject(n);
        throw n;
      };
    }
  };
  var q = new Y();
  function x(l2, e) {
    return q.parse(l2, e);
  }
  x.options = x.setOptions = function(l2) {
    return q.setOptions(l2), x.defaults = q.defaults, ie(x.defaults), x;
  };
  x.getDefaults = j;
  x.defaults = y;
  function vt(...l2) {
    return q.use(...l2), x.defaults = q.defaults, ie(x.defaults), x;
  }
  x.use = vt;
  x.walkTokens = function(l2, e) {
    return q.walkTokens(l2, e);
  };
  x.parseInline = q.parseInline;
  x.Parser = w;
  x.parser = w.parse;
  x.Renderer = C;
  x.TextRenderer = E;
  x.Lexer = O;
  x.lexer = O.lex;
  x.Tokenizer = _;
  x.Hooks = I;
  x.parse = x;
  var Ln = x.options;
  var Cn = x.setOptions;
  var In = x.walkTokens;
  var An = x.parseInline;
  var zn = w.parse;
  var Mn = O.lex;

  // node_modules/dompurify/dist/purify.es.mjs
  function _OverloadYield(e, d) {
    this.v = e, this.k = d;
  }
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _iterableToArrayLimit(r, l2) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l2) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l2); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  function AsyncGenerator(e) {
    var t, n;
    function resume(t2, n2) {
      try {
        var r = e[t2](n2), o = r.value, u = o instanceof _OverloadYield;
        Promise.resolve(u ? o.v : o).then(function(n3) {
          if (u) {
            var i = "return" === t2 && o.k ? t2 : "next";
            if (!o.k || n3.done) return resume(i, n3);
            n3 = e[i](n3).value;
          }
          settle2(!!r.done, n3);
        }, function(e2) {
          resume("throw", e2);
        });
      } catch (e2) {
        settle2(2, e2);
      }
    }
    function settle2(e2, r) {
      2 === e2 ? t.reject(r) : t.resolve({
        value: r,
        done: e2
      }), (t = t.next) ? resume(t.key, t.arg) : n = null;
    }
    this._invoke = function(e2, r) {
      return new Promise(function(o, u) {
        var i = {
          key: e2,
          arg: r,
          resolve: o,
          reject: u,
          next: null
        };
        n ? n = n.next = i : (t = n = i, resume(e2, r));
      });
    }, "function" != typeof e.return && (this.return = void 0);
  }
  AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
    return this;
  }, AsyncGenerator.prototype.next = function(e) {
    return this._invoke("next", e);
  }, AsyncGenerator.prototype.throw = function(e) {
    return this._invoke("throw", e);
  }, AsyncGenerator.prototype.return = function(e) {
    return this._invoke("return", e);
  };
  var entries = Object.entries;
  var setPrototypeOf = Object.setPrototypeOf;
  var isFrozen = Object.isFrozen;
  var getPrototypeOf = Object.getPrototypeOf;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var freeze = Object.freeze;
  var seal = Object.seal;
  var create = Object.create;
  var _ref = typeof Reflect !== "undefined" && Reflect;
  var apply = _ref.apply;
  var construct = _ref.construct;
  if (!freeze) freeze = function freeze2(x2) {
    return x2;
  };
  if (!seal) seal = function seal2(x2) {
    return x2;
  };
  if (!apply) apply = function apply2(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
    return func.apply(thisArg, args);
  };
  if (!construct) construct = function construct2(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) args[_key2 - 1] = arguments[_key2];
    return new Func(...args);
  };
  var arrayForEach = unapply(Array.prototype.forEach);
  Array.prototype.indexOf;
  var arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
  var arrayPop = unapply(Array.prototype.pop);
  var arrayPush = unapply(Array.prototype.push);
  var arraySlice = unapply(Array.prototype.slice);
  var arraySplice = unapply(Array.prototype.splice);
  var arrayIsArray = Array.isArray;
  var setCreate = unconstruct(Set);
  var setAdd = unapply(Set.prototype.add);
  var setHas = unapply(Set.prototype.has);
  var stringToLowerCase = unapply(String.prototype.toLowerCase);
  var stringToString = unapply(String.prototype.toString);
  var stringMatch = unapply(String.prototype.match);
  var stringReplace = unapply(String.prototype.replace);
  var stringIndexOf = unapply(String.prototype.indexOf);
  var stringTrim = unapply(String.prototype.trim);
  var numberToString = unapply(Number.prototype.toString);
  var booleanToString = unapply(Boolean.prototype.toString);
  var bigintToString = typeof BigInt === "undefined" ? null : unapply(BigInt.prototype.toString);
  var symbolToString = typeof Symbol === "undefined" ? null : unapply(Symbol.prototype.toString);
  var objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
  var objectToString = unapply(Object.prototype.toString);
  var regExpTest = unapply(RegExp.prototype.test);
  var typeErrorCreate = unconstruct(TypeError);
  function unapply(func) {
    return function(thisArg) {
      if (thisArg instanceof RegExp) thisArg.lastIndex = 0;
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) args[_key3 - 1] = arguments[_key3];
      return apply(func, thisArg, args);
    };
  }
  function unconstruct(Func) {
    return function() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) args[_key4] = arguments[_key4];
      return construct(Func, args);
    };
  }
  function addToSet(set, array) {
    let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
    if (setPrototypeOf) setPrototypeOf(set, null);
    if (!arrayIsArray(array)) return set;
    let l2 = array.length;
    while (l2--) {
      let element2 = array[l2];
      if (typeof element2 === "string") {
        const lcElement = transformCaseFunc(element2);
        if (lcElement !== element2) {
          if (!isFrozen(array)) array[l2] = lcElement;
          element2 = lcElement;
        }
      }
      set[element2] = true;
    }
    return set;
  }
  function cleanArray(array) {
    for (let index = 0; index < array.length; index++) if (!objectHasOwnProperty(array, index)) array[index] = null;
    return array;
  }
  function clone(object) {
    const newObject = create(null);
    for (const _ref2 of entries(object)) {
      var _ref3 = _slicedToArray(_ref2, 2);
      const property = _ref3[0];
      const value = _ref3[1];
      if (objectHasOwnProperty(object, property)) {
        if (arrayIsArray(value)) newObject[property] = cleanArray(value);
        else if (value && typeof value === "object" && value.constructor === Object) newObject[property] = clone(value);
        else newObject[property] = value;
      }
    }
    return newObject;
  }
  function stringifyValue(value) {
    switch (typeof value) {
      case "string":
        return value;
      case "number":
        return numberToString(value);
      case "boolean":
        return booleanToString(value);
      case "bigint":
        return bigintToString ? bigintToString(value) : "0";
      case "symbol":
        return symbolToString ? symbolToString(value) : "Symbol()";
      case "undefined":
        return objectToString(value);
      case "function":
      case "object": {
        if (value === null) return objectToString(value);
        const valueAsRecord = value;
        const valueToString = lookupGetter(valueAsRecord, "toString");
        if (typeof valueToString === "function") {
          const stringified = valueToString(valueAsRecord);
          return typeof stringified === "string" ? stringified : objectToString(stringified);
        }
        return objectToString(value);
      }
      default:
        return objectToString(value);
    }
  }
  function lookupGetter(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get) return unapply(desc.get);
        if (typeof desc.value === "function") return unapply(desc.value);
      }
      object = getPrototypeOf(object);
    }
    function fallbackValue() {
      return null;
    }
    return fallbackValue;
  }
  function lookupAccessor(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) return desc.get ? unapply(desc.get) : null;
      object = getPrototypeOf(object);
    }
    return null;
  }
  function isRegex(value) {
    try {
      regExpTest(value, "");
      return true;
    } catch (_unused) {
      return false;
    }
  }
  var html$1 = freeze([
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "content",
    "data",
    "datalist",
    "dd",
    "decorator",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "nav",
    "nobr",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "section",
    "select",
    "shadow",
    "slot",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
  ]);
  var svg$1 = freeze([
    "svg",
    "a",
    "altglyph",
    "altglyphdef",
    "altglyphitem",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "circle",
    "clippath",
    "defs",
    "desc",
    "ellipse",
    "enterkeyhint",
    "exportparts",
    "filter",
    "font",
    "g",
    "glyph",
    "glyphref",
    "hkern",
    "image",
    "inputmode",
    "line",
    "lineargradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "part",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialgradient",
    "rect",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textpath",
    "title",
    "tref",
    "tspan",
    "view",
    "vkern"
  ]);
  var svgFilters = freeze([
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence"
  ]);
  var svgDisallowed = freeze([
    "animate",
    "color-profile",
    "cursor",
    "discard",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignobject",
    "hatch",
    "hatchpath",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "missing-glyph",
    "script",
    "set",
    "solidcolor",
    "unknown",
    "use"
  ]);
  var mathMl$1 = freeze([
    "math",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mglyph",
    "mi",
    "mlabeledtr",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "mprescripts"
  ]);
  var mathMlDisallowed = freeze([
    "maction",
    "maligngroup",
    "malignmark",
    "mlongdiv",
    "mscarries",
    "mscarry",
    "msgroup",
    "mstack",
    "msline",
    "msrow",
    "semantics",
    "annotation",
    "annotation-xml",
    "mprescripts",
    "none"
  ]);
  var text = freeze(["#text"]);
  var html = freeze([
    "accept",
    "action",
    "align",
    "alt",
    "autocapitalize",
    "autocomplete",
    "autopictureinpicture",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "capture",
    "cellpadding",
    "cellspacing",
    "checked",
    "cite",
    "class",
    "clear",
    "color",
    "cols",
    "colspan",
    "command",
    "commandfor",
    "controls",
    "controlslist",
    "coords",
    "crossorigin",
    "datetime",
    "decoding",
    "default",
    "dir",
    "disabled",
    "disablepictureinpicture",
    "disableremoteplayback",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "exportparts",
    "face",
    "for",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "id",
    "inert",
    "inputmode",
    "integrity",
    "ismap",
    "kind",
    "label",
    "lang",
    "list",
    "loading",
    "loop",
    "low",
    "max",
    "maxlength",
    "media",
    "method",
    "min",
    "minlength",
    "multiple",
    "muted",
    "name",
    "nonce",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "optimum",
    "part",
    "pattern",
    "placeholder",
    "playsinline",
    "popover",
    "popovertarget",
    "popovertargetaction",
    "poster",
    "preload",
    "pubdate",
    "radiogroup",
    "readonly",
    "rel",
    "required",
    "rev",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "spellcheck",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "srclang",
    "start",
    "src",
    "srcset",
    "step",
    "style",
    "summary",
    "tabindex",
    "title",
    "translate",
    "type",
    "usemap",
    "valign",
    "value",
    "width",
    "wrap",
    "xmlns"
  ]);
  var svg = freeze([
    "accent-height",
    "accumulate",
    "additive",
    "alignment-baseline",
    "amplitude",
    "ascent",
    "attributename",
    "attributetype",
    "azimuth",
    "basefrequency",
    "baseline-shift",
    "begin",
    "bias",
    "by",
    "class",
    "clip",
    "clippathunits",
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "cx",
    "cy",
    "d",
    "dx",
    "dy",
    "diffuseconstant",
    "direction",
    "display",
    "divisor",
    "dominant-baseline",
    "dur",
    "edgemode",
    "elevation",
    "end",
    "exponent",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "filterunits",
    "flood-color",
    "flood-opacity",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyph-name",
    "glyphref",
    "gradientunits",
    "gradienttransform",
    "height",
    "href",
    "id",
    "image-rendering",
    "in",
    "in2",
    "intercept",
    "k",
    "k1",
    "k2",
    "k3",
    "k4",
    "kerning",
    "keypoints",
    "keysplines",
    "keytimes",
    "lang",
    "lengthadjust",
    "letter-spacing",
    "kernelmatrix",
    "kernelunitlength",
    "lighting-color",
    "local",
    "marker-end",
    "marker-mid",
    "marker-start",
    "markerheight",
    "markerunits",
    "markerwidth",
    "maskcontentunits",
    "maskunits",
    "max",
    "mask",
    "mask-type",
    "media",
    "method",
    "mode",
    "min",
    "name",
    "numoctaves",
    "offset",
    "operator",
    "opacity",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "paint-order",
    "path",
    "pathlength",
    "patterncontentunits",
    "patterntransform",
    "patternunits",
    "pointer-events",
    "points",
    "preservealpha",
    "preserveaspectratio",
    "primitiveunits",
    "r",
    "rx",
    "ry",
    "radius",
    "refx",
    "refy",
    "repeatcount",
    "repeatdur",
    "restart",
    "result",
    "rotate",
    "scale",
    "seed",
    "shape-rendering",
    "slope",
    "specularconstant",
    "specularexponent",
    "spreadmethod",
    "startoffset",
    "stddeviation",
    "stitchtiles",
    "stop-color",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke",
    "stroke-width",
    "style",
    "surfacescale",
    "systemlanguage",
    "tabindex",
    "tablevalues",
    "targetx",
    "targety",
    "transform",
    "transform-origin",
    "text-anchor",
    "text-decoration",
    "text-orientation",
    "text-rendering",
    "textlength",
    "type",
    "u1",
    "u2",
    "unicode",
    "values",
    "vector-effect",
    "viewbox",
    "visibility",
    "version",
    "vert-adv-y",
    "vert-origin-x",
    "vert-origin-y",
    "width",
    "word-spacing",
    "wrap",
    "writing-mode",
    "xchannelselector",
    "ychannelselector",
    "x",
    "x1",
    "x2",
    "xmlns",
    "y",
    "y1",
    "y2",
    "z",
    "zoomandpan"
  ]);
  var mathMl = freeze([
    "accent",
    "accentunder",
    "align",
    "bevelled",
    "close",
    "columnalign",
    "columnlines",
    "columnspacing",
    "columnspan",
    "denomalign",
    "depth",
    "dir",
    "display",
    "displaystyle",
    "encoding",
    "fence",
    "frame",
    "height",
    "href",
    "id",
    "largeop",
    "length",
    "linethickness",
    "lquote",
    "lspace",
    "mathbackground",
    "mathcolor",
    "mathsize",
    "mathvariant",
    "maxsize",
    "minsize",
    "movablelimits",
    "notation",
    "numalign",
    "open",
    "rowalign",
    "rowlines",
    "rowspacing",
    "rowspan",
    "rspace",
    "rquote",
    "scriptlevel",
    "scriptminsize",
    "scriptsizemultiplier",
    "selection",
    "separator",
    "separators",
    "stretchy",
    "subscriptshift",
    "supscriptshift",
    "symmetric",
    "voffset",
    "width",
    "xmlns"
  ]);
  var xml = freeze([
    "xlink:href",
    "xml:id",
    "xlink:title",
    "xml:space",
    "xmlns:xlink"
  ]);
  var MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
  var ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
  var TMPLIT_EXPR = seal(/\${[\w\W]*/g);
  var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
  var ARIA_ATTR = seal(/^aria-[\-\w]+$/);
  var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
  var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
  var DOCTYPE_NAME = seal(/^html$/i);
  var CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
  var ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
  var COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
  var FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
  var SELF_CLOSING_TAG = seal(/\/>/i);
  var NODE_TYPE = {
    element: 1,
    attribute: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    entityNode: 6,
    processingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12
  };
  var LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, [
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
  ]));
  var getGlobal = function getGlobal2() {
    return typeof window === "undefined" ? null : window;
  };
  var _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
    if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function") return null;
    let suffix = null;
    const ATTR_NAME = "data-tt-policy-suffix";
    if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) suffix = purifyHostElement.getAttribute(ATTR_NAME);
    const policyName = "dompurify" + (suffix ? "#" + suffix : "");
    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML(html2) {
          return html2;
        },
        createScriptURL(scriptUrl) {
          return scriptUrl;
        }
      });
    } catch (_2) {
      console.warn("TrustedTypes policy " + policyName + " could not be created.");
      return null;
    }
  };
  var _createHooksMap = function _createHooksMap2() {
    return {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: []
    };
  };
  var _resolveSetOption = function _resolveSetOption2(cfg, key, fallback, options) {
    return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
  };
  var _resolveObjectOption = function _resolveObjectOption2(cfg, key, makeFallback) {
    const value = objectHasOwnProperty(cfg, key) ? cfg[key] : void 0;
    return value && typeof value === "object" ? clone(value) : makeFallback();
  };
  function createDOMPurify() {
    let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
    const DOMPurify = (root) => createDOMPurify(root);
    DOMPurify.version = "3.4.17";
    DOMPurify.removed = [];
    if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
      DOMPurify.isSupported = false;
      return DOMPurify;
    }
    let document2 = window2.document;
    const originalDocument = document2;
    const currentScript = originalDocument.currentScript;
    window2.DocumentFragment;
    const HTMLTemplateElement = window2.HTMLTemplateElement, Node = window2.Node, Element = window2.Element, NodeFilter = window2.NodeFilter;
    window2.NamedNodeMap === void 0 && (window2.NamedNodeMap || window2.MozNamedAttrMap);
    window2.HTMLFormElement;
    const DOMParser = window2.DOMParser, trustedTypes = window2.trustedTypes;
    const ElementPrototype = Element.prototype;
    const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
    const remove = lookupGetter(ElementPrototype, "remove");
    const removeAttributeNode = lookupGetter(ElementPrototype, "removeAttributeNode");
    const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
    const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
    const getParentNode = lookupGetter(ElementPrototype, "parentNode");
    const getShadowRoot = lookupGetter(ElementPrototype, "shadowRoot");
    const getAttributes = lookupGetter(ElementPrototype, "attributes");
    const getNodeType = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeType") : null;
    const getNodeName = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeName") : null;
    const getOwnerDocument = Node && Node.prototype ? lookupGetter(Node.prototype, "ownerDocument") : null;
    const _readNodeType = function _readNodeType2(node2) {
      return getNodeType ? getNodeType(node2) : node2.nodeType;
    };
    const _readNodeName = function _readNodeName2(node2) {
      return getNodeName ? getNodeName(node2) : node2.nodeName;
    };
    const getNamespaceURI = lookupAccessor(ElementPrototype, "namespaceURI");
    const _readNamespaceURI = function _readNamespaceURI2(element2) {
      return getNamespaceURI ? getNamespaceURI(element2) : element2.namespaceURI;
    };
    if (typeof HTMLTemplateElement === "function") {
      const template = document2.createElement("template");
      if (template.content && template.content.ownerDocument) document2 = template.content.ownerDocument;
    }
    let trustedTypesPolicy;
    let emptyHTML = "";
    let defaultTrustedTypesPolicy;
    let defaultTrustedTypesPolicyResolved = false;
    let IN_TRUSTED_TYPES_POLICY = 0;
    const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy2() {
      if (IN_TRUSTED_TYPES_POLICY > 0) throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
    };
    const _createTrustedHTML = function _createTrustedHTML2(html2) {
      _assertNotInTrustedTypesPolicy();
      IN_TRUSTED_TYPES_POLICY++;
      try {
        return trustedTypesPolicy.createHTML(html2);
      } finally {
        IN_TRUSTED_TYPES_POLICY--;
      }
    };
    const _createTrustedScriptURL = function _createTrustedScriptURL2(scriptUrl) {
      _assertNotInTrustedTypesPolicy();
      IN_TRUSTED_TYPES_POLICY++;
      try {
        return trustedTypesPolicy.createScriptURL(scriptUrl);
      } finally {
        IN_TRUSTED_TYPES_POLICY--;
      }
    };
    const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy2() {
      if (!defaultTrustedTypesPolicyResolved) {
        defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
        defaultTrustedTypesPolicyResolved = true;
      }
      return defaultTrustedTypesPolicy;
    };
    const _document = document2, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
    const importNode = originalDocument.importNode;
    let hooks = _createHooksMap();
    DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
    const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
    let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
    let ALLOWED_TAGS = null;
    const DEFAULT_ALLOWED_TAGS = addToSet({}, [
      ...html$1,
      ...svg$1,
      ...svgFilters,
      ...mathMl$1,
      ...text
    ]);
    let ALLOWED_ATTR = null;
    const DEFAULT_ALLOWED_ATTR = addToSet({}, [
      ...html,
      ...svg,
      ...mathMl,
      ...xml
    ]);
    let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));
    let FORBID_TAGS = null;
    let FORBID_ATTR = null;
    const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
      tagCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      }
    }));
    let ALLOW_ARIA_ATTR = true;
    let ALLOW_DATA_ATTR = true;
    let ALLOW_UNKNOWN_PROTOCOLS = false;
    let ALLOW_SELF_CLOSE_IN_ATTR = true;
    let SAFE_FOR_TEMPLATES = false;
    let SAFE_FOR_XML = true;
    let WHOLE_DOCUMENT = false;
    let SET_CONFIG = false;
    let SET_CONFIG_ALLOWED_TAGS = null;
    let SET_CONFIG_ALLOWED_ATTR = null;
    let FORCE_BODY = false;
    let RETURN_DOM = false;
    let RETURN_DOM_FRAGMENT = false;
    let RETURN_TRUSTED_TYPE = false;
    let SANITIZE_DOM = true;
    let SANITIZE_NAMED_PROPS = false;
    const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
    let KEEP_CONTENT = true;
    let IN_PLACE = false;
    let IN_PLACE_VISITED = null;
    let USE_PROFILES = {};
    let FORBID_CONTENTS = null;
    const DEFAULT_FORBID_CONTENTS = addToSet({}, [
      "annotation-xml",
      "audio",
      "colgroup",
      "desc",
      "foreignobject",
      "head",
      "iframe",
      "math",
      "mi",
      "mn",
      "mo",
      "ms",
      "mtext",
      "noembed",
      "noframes",
      "noscript",
      "plaintext",
      "script",
      "selectedcontent",
      "style",
      "svg",
      "template",
      "thead",
      "title",
      "video",
      "xmp"
    ]);
    let DATA_URI_TAGS = null;
    const DEFAULT_DATA_URI_TAGS = addToSet({}, [
      "audio",
      "video",
      "img",
      "source",
      "image",
      "track"
    ]);
    let URI_SAFE_ATTRIBUTES = null;
    const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
      "alt",
      "class",
      "for",
      "id",
      "label",
      "name",
      "pattern",
      "placeholder",
      "role",
      "summary",
      "title",
      "value",
      "style",
      "xmlns"
    ]);
    const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
    let NAMESPACE = HTML_NAMESPACE;
    let IS_EMPTY_INPUT = false;
    let ALLOWED_NAMESPACES = null;
    const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [
      MATHML_NAMESPACE,
      SVG_NAMESPACE,
      HTML_NAMESPACE
    ], stringToString);
    const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext"
    ]);
    let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
    const DEFAULT_HTML_INTEGRATION_POINTS = freeze(["annotation-xml"]);
    let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
    const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
      "title",
      "style",
      "font",
      "a",
      "script"
    ]);
    let PARSER_MEDIA_TYPE = null;
    const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
    const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
    let transformCaseFunc = null;
    let CONFIG = null;
    const formElement = document2.createElement("form");
    const isRegexOrFunction = function isRegexOrFunction2(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };
    const _parseConfig = function _parseConfig2() {
      let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (CONFIG && CONFIG === cfg) return;
      if (!cfg || typeof cfg !== "object") cfg = {};
      cfg = clone(cfg);
      PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
      transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
      ALLOWED_TAGS = _resolveSetOption(cfg, "ALLOWED_TAGS", DEFAULT_ALLOWED_TAGS, { transform: transformCaseFunc });
      ALLOWED_ATTR = _resolveSetOption(cfg, "ALLOWED_ATTR", DEFAULT_ALLOWED_ATTR, { transform: transformCaseFunc });
      ALLOWED_NAMESPACES = _resolveSetOption(cfg, "ALLOWED_NAMESPACES", DEFAULT_ALLOWED_NAMESPACES, { transform: stringToString });
      URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, "ADD_URI_SAFE_ATTR", DEFAULT_URI_SAFE_ATTRIBUTES, {
        transform: transformCaseFunc,
        base: DEFAULT_URI_SAFE_ATTRIBUTES
      });
      DATA_URI_TAGS = _resolveSetOption(cfg, "ADD_DATA_URI_TAGS", DEFAULT_DATA_URI_TAGS, {
        transform: transformCaseFunc,
        base: DEFAULT_DATA_URI_TAGS
      });
      FORBID_CONTENTS = _resolveSetOption(cfg, "FORBID_CONTENTS", DEFAULT_FORBID_CONTENTS, { transform: transformCaseFunc });
      FORBID_TAGS = _resolveSetOption(cfg, "FORBID_TAGS", clone({}), { transform: transformCaseFunc });
      FORBID_ATTR = _resolveSetOption(cfg, "FORBID_ATTR", clone({}), { transform: transformCaseFunc });
      USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === "object" ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
      SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
      RETURN_DOM = cfg.RETURN_DOM || false;
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
      FORCE_BODY = cfg.FORCE_BODY || false;
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
      IN_PLACE = cfg.IN_PLACE || false;
      IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI;
      NAMESPACE = typeof cfg.NAMESPACE === "string" ? cfg.NAMESPACE : HTML_NAMESPACE;
      MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(cfg, "MATHML_TEXT_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS));
      HTML_INTEGRATION_POINTS = _resolveObjectOption(cfg, "HTML_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS));
      const customElementHandling = _resolveObjectOption(cfg, "CUSTOM_ELEMENT_HANDLING", () => create(null));
      CUSTOM_ELEMENT_HANDLING = create(null);
      if (objectHasOwnProperty(customElementHandling, "tagNameCheck") && isRegexOrFunction(customElementHandling.tagNameCheck)) CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck;
      if (objectHasOwnProperty(customElementHandling, "attributeNameCheck") && isRegexOrFunction(customElementHandling.attributeNameCheck)) CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck;
      if (objectHasOwnProperty(customElementHandling, "allowCustomizedBuiltInElements") && typeof customElementHandling.allowCustomizedBuiltInElements === "boolean") CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements;
      seal(CUSTOM_ELEMENT_HANDLING);
      if (SAFE_FOR_TEMPLATES) ALLOW_DATA_ATTR = false;
      if (RETURN_DOM_FRAGMENT) RETURN_DOM = true;
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, text);
        ALLOWED_ATTR = create(null);
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html);
        }
        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }
      EXTRA_ELEMENT_HANDLING.tagCheck = null;
      EXTRA_ELEMENT_HANDLING.attributeCheck = null;
      if (objectHasOwnProperty(cfg, "ADD_TAGS")) {
        if (typeof cfg.ADD_TAGS === "function") EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
        else if (arrayIsArray(cfg.ADD_TAGS)) {
          if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) ALLOWED_TAGS = clone(ALLOWED_TAGS);
          addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
        }
      }
      if (objectHasOwnProperty(cfg, "ADD_ATTR")) {
        if (typeof cfg.ADD_ATTR === "function") EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
        else if (arrayIsArray(cfg.ADD_ATTR)) {
          if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) ALLOWED_ATTR = clone(ALLOWED_ATTR);
          addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
        }
      }
      if (objectHasOwnProperty(cfg, "ADD_FORBID_CONTENTS") && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) FORBID_CONTENTS = clone(FORBID_CONTENTS);
        addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
      }
      if (KEEP_CONTENT) ALLOWED_TAGS["#text"] = true;
      if (WHOLE_DOCUMENT) addToSet(ALLOWED_TAGS, [
        "html",
        "head",
        "body"
      ]);
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ["tbody"]);
        delete FORBID_TAGS.tbody;
      }
      if (cfg.TRUSTED_TYPES_POLICY) {
        if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        const previousTrustedTypesPolicy = trustedTypesPolicy;
        trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
        try {
          emptyHTML = _createTrustedHTML("");
        } catch (error) {
          trustedTypesPolicy = previousTrustedTypesPolicy;
          throw error;
        }
      } else if (cfg.TRUSTED_TYPES_POLICY === null) {
        trustedTypesPolicy = void 0;
        emptyHTML = "";
      } else {
        if (trustedTypesPolicy === void 0) trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
        if (trustedTypesPolicy && typeof emptyHTML === "string") emptyHTML = _createTrustedHTML("");
      }
      if (freeze) freeze(cfg);
      CONFIG = cfg;
    };
    const ALL_SVG_TAGS = addToSet({}, [
      ...svg$1,
      ...svgFilters,
      ...svgDisallowed
    ]);
    const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
    const _checkSvgNamespace = function _checkSvgNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "svg";
      if (parent.namespaceURI === MATHML_NAMESPACE) return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      return Boolean(ALL_SVG_TAGS[tagName]);
    };
    const _checkMathMlNamespace = function _checkMathMlNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "math";
      if (parent.namespaceURI === SVG_NAMESPACE) return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
      return Boolean(ALL_MATHML_TAGS[tagName]);
    };
    const _checkHtmlNamespace = function _checkHtmlNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) return false;
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) return false;
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    };
    const _checkValidNamespace = function _checkValidNamespace2(element2) {
      const elementNamespace = _readNamespaceURI(element2);
      const tagName = stringToLowerCase(_readNodeName(element2));
      const parentNode = getParentNode(element2);
      let parent;
      let parentTagName;
      if (parentNode && _readNodeType(parentNode) === NODE_TYPE.element) {
        parent = { namespaceURI: _readNamespaceURI(parentNode) };
        parentTagName = stringToLowerCase(_readNodeName(parentNode));
      } else {
        parent = { namespaceURI: NAMESPACE };
        parentTagName = "template";
      }
      if (!ALLOWED_NAMESPACES[elementNamespace]) return false;
      if (elementNamespace === SVG_NAMESPACE) return _checkSvgNamespace(tagName, parent, parentTagName);
      if (elementNamespace === MATHML_NAMESPACE) return _checkMathMlNamespace(tagName, parent, parentTagName);
      if (elementNamespace === HTML_NAMESPACE) return _checkHtmlNamespace(tagName, parent, parentTagName);
      if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[elementNamespace]) return true;
      return false;
    };
    const _forceRemove = function _forceRemove2(node2) {
      arrayPush(DOMPurify.removed, { element: node2 });
      try {
        getParentNode(node2).removeChild(node2);
      } catch (_2) {
        remove(node2);
        if (!getParentNode(node2)) throw typeErrorCreate("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
      }
    };
    const _stripAttributeNode = function _stripAttributeNode2(element2, attribute, name) {
      try {
        removeAttributeNode(element2, attribute);
      } catch (_2) {
        try {
          element2.removeAttribute(name);
        } catch (_3) {
        }
      }
    };
    const _neutralizeRoot = function _neutralizeRoot2(root) {
      _neutralizeSubtree(root);
      const childNodes = getChildNodes(root);
      if (childNodes) arrayForEach(arraySlice(childNodes), (child) => {
        try {
          remove(child);
        } catch (_2) {
        }
      });
      const attributes = _readNodeType(root) === NODE_TYPE.element ? getAttributes(root) : null;
      if (attributes) for (let i = attributes.length - 1; i >= 0; --i) {
        const attribute = attributes[i];
        const name = attribute && attribute.name;
        if (typeof name === "string") _stripAttributeNode(root, attribute, name);
      }
    };
    const _removeAttribute = function _removeAttribute2(name, element2, attr) {
      if (!attr) try {
        attr = element2.getAttributeNode(name);
      } catch (_2) {
        attr = null;
      }
      arrayPush(DOMPurify.removed, {
        attribute: attr || null,
        from: element2
      });
      try {
        if (attr) removeAttributeNode(element2, attr);
        else element2.removeAttribute(name);
      } catch (_2) {
        try {
          element2.removeAttribute(name);
        } catch (_3) {
        }
      }
      if (name === "is") {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) try {
          _forceRemove(element2);
        } catch (_2) {
        }
        else try {
          element2.setAttribute(name, "");
        } catch (_2) {
        }
      }
    };
    const _stripDisallowedAttributes = function _stripDisallowedAttributes2(element2) {
      const attributes = getAttributes(element2);
      if (!attributes) return;
      for (let i = attributes.length - 1; i >= 0; --i) {
        const attribute = attributes[i];
        const name = attribute && attribute.name;
        if (typeof name !== "string" || ALLOWED_ATTR[transformCaseFunc(name)]) continue;
        _stripAttributeNode(element2, attribute, name);
      }
    };
    const _walkTree = function _walkTree2(root, visit) {
      let intoShadow = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      const stack = [root];
      while (stack.length > 0) {
        const node2 = stack.pop();
        if (visit(node2) === false) continue;
        if (intoShadow && _readNodeType(node2) === NODE_TYPE.element) {
          const shadowRoot = getShadowRoot(node2);
          if (_isDocumentFragment(shadowRoot)) stack.push(shadowRoot);
        }
        const childNodes = getChildNodes(node2);
        if (childNodes) for (let i = childNodes.length - 1; i >= 0; --i) stack.push(childNodes[i]);
      }
    };
    const _neutralizeSubtree = function _neutralizeSubtree2(root) {
      _walkTree(root, (node2) => {
        if (_readNodeType(node2) === NODE_TYPE.element) _stripDisallowedAttributes(node2);
      });
    };
    const _collectLiveNodes = function _collectLiveNodes2(root) {
      const nodes = [];
      _walkTree(root, (node2) => {
        nodes.push(node2);
      }, true);
      return nodes;
    };
    const _neutralizeEscapedElements = function _neutralizeEscapedElements2(root, before) {
      const reachable = setCreate();
      arrayForEach(_collectLiveNodes(root), (node2) => {
        if (_readNodeType(node2) === NODE_TYPE.element) setAdd(reachable, node2);
      });
      arrayForEach(before, (node2) => {
        if (_readNodeType(node2) === NODE_TYPE.element && !setHas(reachable, node2)) _stripDisallowedAttributes(node2);
      });
    };
    const _neutralizeDiscarded = function _neutralizeDiscarded2(root, before) {
      let rootRemoved = false;
      arrayForEach(DOMPurify.removed, (entry) => {
        if (entry.element) {
          rootRemoved = rootRemoved || entry.element === root;
          _neutralizeSubtree(entry.element);
        }
      });
      _neutralizeEscapedElements(root, before);
      return rootRemoved;
    };
    const MAX_UNVISITED_ROUNDS = 8;
    const _sanitizeUnvisitedNodes = function _sanitizeUnvisitedNodes2(root, before) {
      const visited = IN_PLACE_VISITED;
      let original = null;
      const getOriginal = () => {
        if (!original) {
          original = setCreate();
          arrayForEach(before, (beforeNode) => {
            setAdd(original, beforeNode);
          });
        }
        return original;
      };
      for (let round = 0; ; round++) {
        const live = _collectLiveNodes(root);
        const containers = [root];
        let pending = false;
        arrayForEach(live, (node2) => {
          if (_readNodeType(node2) === NODE_TYPE.documentFragment) arrayPush(containers, node2);
          else if (!pending && !setHas(visited, node2)) pending = setHas(getOriginal(), node2);
        });
        if (!pending) return;
        if (round >= MAX_UNVISITED_ROUNDS) throw typeErrorCreate("the tree kept changing during in-place sanitization; refusing to return it");
        arrayForEach(containers, (container, index) => {
          _sanitizeUnvisitedIn(container, index > 0, root, getOriginal());
        });
      }
    };
    const _sanitizeUnvisitedIn = function _sanitizeUnvisitedIn2(container, inShadow, root, original) {
      const iterator = _createNodeIterator(container);
      let node2;
      while (node2 = iterator.nextNode()) {
        if (!setHas(original, node2) || setHas(IN_PLACE_VISITED, node2)) continue;
        if (inShadow) _executeHooks(hooks.uponSanitizeShadowNode, node2, null);
        _sanitizeElements(node2, root);
        _sanitizeAttributes(node2, root);
        if (_isDocumentFragment(node2.content)) _sanitizeShadowDOM2(node2.content);
      }
    };
    const _markVisited = function _markVisited2(node2) {
      if (IN_PLACE_VISITED) setAdd(IN_PLACE_VISITED, node2);
    };
    const _isPatchLinkageAttribute = function _isPatchLinkageAttribute2(lcName, lcTag) {
      if (!SAFE_FOR_XML) return false;
      if (lcName === "patchsrc") return true;
      return lcName === "for" && lcTag !== "label" && lcTag !== "output";
    };
    const _neutralizePatchLinkage = function _neutralizePatchLinkage2(root) {
      if (!SAFE_FOR_XML) return;
      _walkTree(root, (node2) => {
        const nodeType = _readNodeType(node2);
        if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node2.data)) {
          try {
            remove(node2);
          } catch (_2) {
          }
          return false;
        }
        if (nodeType === NODE_TYPE.element) {
          const element2 = node2;
          const lcTag = transformCaseFunc(_readNodeName(node2));
          try {
            if (element2.hasAttribute && element2.hasAttribute("patchsrc")) element2.removeAttribute("patchsrc");
            if (element2.hasAttribute && element2.hasAttribute("for") && _isPatchLinkageAttribute("for", lcTag)) element2.removeAttribute("for");
          } catch (_2) {
          }
        }
        return true;
      });
    };
    const _initDocument = function _initDocument2(dirty2) {
      let doc = null;
      let leadingWhitespace = null;
      if (FORCE_BODY) dirty2 = "<remove></remove>" + dirty2;
      else {
        const matches = stringMatch(dirty2, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }
      if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE) dirty2 = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty2 + "</body></html>";
      const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty2) : dirty2;
      if (NAMESPACE === HTML_NAMESPACE) try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_2) {
      }
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, "template", null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_2) {
        }
      }
      const body = doc.body || doc.documentElement;
      if (dirty2 && leadingWhitespace) body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      if (NAMESPACE === HTML_NAMESPACE) return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };
    const _createNodeIterator = function _createNodeIterator2(root) {
      const doc = getOwnerDocument ? getOwnerDocument(root) : root.ownerDocument;
      return createNodeIterator.call(doc || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
    };
    const _stripTemplateExpressions = function _stripTemplateExpressions2(value) {
      value = stringReplace(value, MUSTACHE_EXPR$1, " ");
      value = stringReplace(value, ERB_EXPR$1, " ");
      value = stringReplace(value, TMPLIT_EXPR$1, " ");
      return value;
    };
    const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node2) {
      var _node$querySelectorAl;
      _scrubOwnCharacterData(node2);
      const templates = (_node$querySelectorAl = node2.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node2, "template");
      if (templates) arrayForEach(templates, (tmpl) => {
        if (_isDocumentFragment(tmpl.content)) _scrubTemplateExpressions2(tmpl.content);
      });
    };
    const _scrubOwnCharacterData = function _scrubOwnCharacterData2(node2) {
      node2.normalize();
      const doc = getOwnerDocument ? getOwnerDocument(node2) : node2.ownerDocument;
      const walker = createNodeIterator.call(doc || node2, node2, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION | NodeFilter.SHOW_PROCESSING_INSTRUCTION, null);
      let currentNode = walker.nextNode();
      while (currentNode) {
        currentNode.data = _stripTemplateExpressions(currentNode.data);
        currentNode = walker.nextNode();
      }
    };
    const _isClobbered = function _isClobbered2(element2) {
      const realTagName = getNodeName ? getNodeName(element2) : null;
      if (typeof realTagName !== "string") return false;
      if (transformCaseFunc(realTagName) !== "form") return false;
      return typeof element2.nodeName !== "string" || typeof element2.textContent !== "string" || typeof element2.removeChild !== "function" || element2.attributes !== getAttributes(element2) || typeof element2.removeAttribute !== "function" || typeof element2.removeAttributeNode !== "function" || typeof element2.getAttributeNode !== "function" || typeof element2.setAttribute !== "function" || typeof element2.namespaceURI !== "string" || typeof element2.insertBefore !== "function" || typeof element2.hasChildNodes !== "function" || element2.nodeType !== getNodeType(element2) || element2.childNodes !== getChildNodes(element2);
    };
    const _isDocumentFragment = function _isDocumentFragment2(value) {
      if (!getNodeType || typeof value !== "object" || value === null) return false;
      try {
        return getNodeType(value) === NODE_TYPE.documentFragment;
      } catch (_2) {
        return false;
      }
    };
    const _isNode = function _isNode2(value) {
      if (!getNodeType || typeof value !== "object" || value === null) return false;
      try {
        return typeof getNodeType(value) === "number";
      } catch (_2) {
        return false;
      }
    };
    function _executeHooks(hooks2, currentNode, data) {
      if (hooks2.length === 0) return;
      arrayForEach(hooks2, (hook) => {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    }
    const _isUnsafeNode = function _isUnsafeNode2(currentNode, tagName) {
      if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML)) return true;
      if (SAFE_FOR_XML && LITERAL_TEXT_ELEMENTS[tagName] && _readNodeType(currentNode) === NODE_TYPE.element && _readNamespaceURI(currentNode) === HTML_NAMESPACE && (_isNode(currentNode.firstElementChild) || typeof currentNode.textContent === "string" && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent))) return true;
      if (currentNode.nodeType === NODE_TYPE.processingInstruction) return true;
      if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data)) return true;
      return false;
    };
    const _matchesNameCheck = function _matchesNameCheck2(check, name) {
      if (check instanceof RegExp) return regExpTest(check, name);
      if (check instanceof Function) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
        return Boolean(check(name, ...args));
      }
      return false;
    };
    const _sanitizeDisallowedNode = function _sanitizeDisallowedNode2(currentNode, tagName, root) {
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && !FORBID_CONTENTS[stringToLowerCase(tagName)]) {
        const parentNode = getParentNode(currentNode);
        const childNodes = getChildNodes(currentNode);
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const hoisted = currentNode === root ? cloneNode(childNodes[i], true) : childNodes[i];
            parentNode.insertBefore(hoisted, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    };
    const _forkSharedAllowlist = function _forkSharedAllowlist2(hookList, set, defaultSet, setConfigSet) {
      if (hookList.length === 0) return set;
      return set === defaultSet || set === setConfigSet ? clone(set) : set;
    };
    const _handleHookDetachedNode = function _handleHookDetachedNode2(currentNode, root) {
      if (currentNode === root || getParentNode(currentNode) !== null) return false;
      if (IN_PLACE) _neutralizeSubtree(currentNode);
      return true;
    };
    const _sanitizeElements = function _sanitizeElements2(currentNode, root) {
      _markVisited(currentNode);
      _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
      if (_handleHookDetachedNode(currentNode, root)) return true;
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }
      const tagName = transformCaseFunc(_readNodeName(currentNode));
      ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
      _executeHooks(hooks.uponSanitizeElement, currentNode, {
        tagName,
        allowedTags: ALLOWED_TAGS
      });
      if (_handleHookDetachedNode(currentNode, root)) return true;
      if (_isUnsafeNode(currentNode, tagName)) {
        _forceRemove(currentNode);
        return true;
      }
      if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
        const removed = _sanitizeDisallowedNode(currentNode, tagName, root);
        if (removed === false) {
          _executeHooks(hooks.afterSanitizeElements, currentNode, null);
          if (_handleHookDetachedNode(currentNode, root)) return true;
        }
        return removed;
      }
      if (_readNodeType(currentNode) === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }
      if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
        const content = _stripTemplateExpressions(currentNode.textContent);
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          currentNode.textContent = content;
        }
      }
      _executeHooks(hooks.afterSanitizeElements, currentNode, null);
      return _handleHookDetachedNode(currentNode, root);
    };
    const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
      if (FORBID_ATTR[lcName]) return false;
      if (_isPatchLinkageAttribute(lcName, lcTag)) return false;
      if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) return false;
      const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
      if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName)) return true;
      if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) return true;
      if (!nameIsPermitted) return _isBasicCustomElement(lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName, lcTag) || lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value);
      if (URI_SAFE_ATTRIBUTES[lcName]) return true;
      if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
      if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag]) return true;
      if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
      return !value;
    };
    const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
      "annotation-xml",
      "color-profile",
      "font-face",
      "font-face-format",
      "font-face-name",
      "font-face-src",
      "font-face-uri",
      "missing-glyph"
    ]);
    const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
      return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
    };
    const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute2(lcTag, lcName, namespaceURI, value) {
      if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function" && !namespaceURI) switch (trustedTypes.getAttributeType(lcTag, lcName)) {
        case "TrustedHTML":
          return _createTrustedHTML(value);
        case "TrustedScriptURL":
          return _createTrustedScriptURL(value);
      }
      return value;
    };
    const _setAttributeValue = function _setAttributeValue2(currentNode, name, namespaceURI, value) {
      try {
        if (namespaceURI) currentNode.setAttributeNS(namespaceURI, name, value);
        else currentNode.setAttribute(name, value);
        if (_isClobbered(currentNode)) {
          _forceRemove(currentNode);
          return false;
        }
        return true;
      } catch (_2) {
        _removeAttribute(name, currentNode);
        return false;
      }
    };
    const _isUnsafeAttributeValue = function _isUnsafeAttributeValue2(name, value) {
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) return true;
      return stringToLowerCase(name) === "attributename" && stringMatch(value, "href") !== null;
    };
    const _sanitizeAttributes = function _sanitizeAttributes2(currentNode, root) {
      _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
      if (_handleHookDetachedNode(currentNode, root)) return;
      const attributes = currentNode.attributes;
      if (!attributes || _isClobbered(currentNode)) return;
      ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
      const hookEvent = {
        attrName: "",
        attrValue: "",
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR,
        forceKeepAttr: void 0
      };
      let l2 = attributes.length;
      const lcTag = transformCaseFunc(currentNode.nodeName);
      while (l2--) {
        const attr = attributes[l2];
        const name = attr.name, namespaceURI = attr.namespaceURI, attrValue = attr.value;
        const lcName = transformCaseFunc(name);
        const initValue = attrValue;
        let value = name === "value" ? initValue : stringTrim(initValue);
        let recreatedNamedProp = false;
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = void 0;
        _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
        value = hookEvent.attrValue;
        if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name") && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
          _removeAttribute(name, currentNode, attr);
          value = SANITIZE_NAMED_PROPS_PREFIX + value;
          recreatedNamedProp = true;
        }
        if (_isUnsafeAttributeValue(name, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (hookEvent.forceKeepAttr) continue;
        if (!hookEvent.keepAttr) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (SAFE_FOR_TEMPLATES) value = _stripTemplateExpressions(value);
        if (!_isValidAttribute(lcTag, lcName, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
        if (value !== initValue) {
          if (_setAttributeValue(currentNode, name, namespaceURI, value) && recreatedNamedProp) arrayPop(DOMPurify.removed);
        }
      }
      _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
      _handleHookDetachedNode(currentNode, root);
    };
    const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
      let shadowNode = null;
      const shadowIterator = _createNodeIterator(fragment);
      _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
      while (shadowNode = shadowIterator.nextNode()) {
        _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
        _sanitizeElements(shadowNode, fragment);
        _sanitizeAttributes(shadowNode, fragment);
        if (_isDocumentFragment(shadowNode.content)) _sanitizeShadowDOM2(shadowNode.content);
        if (_readNodeType(shadowNode) === NODE_TYPE.element) {
          const innerSr = getShadowRoot(shadowNode);
          if (_isDocumentFragment(innerSr)) {
            _sanitizeAttachedShadowRoots(innerSr);
            _sanitizeShadowDOM2(innerSr);
          }
        }
      }
      if (SAFE_FOR_TEMPLATES) _scrubOwnCharacterData(fragment);
      _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
    };
    const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots2(root) {
      const stack = [{
        node: root,
        shadow: null
      }];
      while (stack.length > 0) {
        const item = stack.pop();
        if (item.shadow) {
          _sanitizeShadowDOM2(item.shadow);
          continue;
        }
        const node2 = item.node;
        const isElement = _readNodeType(node2) === NODE_TYPE.element;
        const childNodes = getChildNodes(node2);
        if (childNodes) for (let i = childNodes.length - 1; i >= 0; --i) stack.push({
          node: childNodes[i],
          shadow: null
        });
        if (isElement) {
          const rootName = getNodeName ? getNodeName(node2) : null;
          if (typeof rootName === "string" && transformCaseFunc(rootName) === "template") {
            const content = node2.content;
            if (_isDocumentFragment(content)) stack.push({
              node: content,
              shadow: null
            });
          }
        }
        if (isElement) {
          const sr = getShadowRoot(node2);
          if (_isDocumentFragment(sr)) stack.push({
            node: null,
            shadow: sr
          }, {
            node: sr,
            shadow: null
          });
        }
      }
    };
    DOMPurify.sanitize = function(dirty2) {
      let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      let body = null;
      let importedNode = null;
      let currentNode = null;
      let returnNode = null;
      IS_EMPTY_INPUT = !dirty2;
      if (IS_EMPTY_INPUT) dirty2 = "<!-->";
      if (typeof dirty2 !== "string" && !_isNode(dirty2)) {
        dirty2 = stringifyValue(dirty2);
        if (typeof dirty2 !== "string") throw typeErrorCreate("dirty is not a string, aborting");
      }
      if (!DOMPurify.isSupported) return dirty2;
      if (SET_CONFIG) {
        ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
        ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
      } else _parseConfig(cfg);
      if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0) ALLOWED_TAGS = clone(ALLOWED_TAGS);
      if (hooks.uponSanitizeAttribute.length > 0) ALLOWED_ATTR = clone(ALLOWED_ATTR);
      DOMPurify.removed = [];
      const inPlace = IN_PLACE && typeof dirty2 !== "string" && _isNode(dirty2);
      let inPlaceNodes = [];
      const outerVisited = IN_PLACE_VISITED;
      if (inPlace) {
        _neutralizePatchLinkage(dirty2);
        const nn = _readNodeName(dirty2);
        if (typeof nn === "string") {
          const tagName = transformCaseFunc(nn);
          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            _neutralizeRoot(dirty2);
            throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
          }
        }
        if (_isClobbered(dirty2)) {
          _neutralizeRoot(dirty2);
          throw typeErrorCreate("root node is clobbered and cannot be sanitized in-place");
        }
        inPlaceNodes = _collectLiveNodes(dirty2);
        IN_PLACE_VISITED = setCreate();
      } else if (_isNode(dirty2)) {
        body = _initDocument("<!---->");
        importedNode = body.ownerDocument.importNode(dirty2, true);
        if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY") body = importedNode;
        else if (importedNode.nodeName === "HTML") body = importedNode;
        else body.appendChild(importedNode);
        _sanitizeAttachedShadowRoots(body);
      } else {
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty2.indexOf("<") === -1) return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty2) : dirty2;
        body = _initDocument(dirty2);
        if (!body) return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
      }
      if (body && FORCE_BODY) _forceRemove(body.firstChild);
      const walkRoot = inPlace ? dirty2 : body;
      try {
        if (inPlace) _sanitizeAttachedShadowRoots(dirty2);
        const nodeIterator = _createNodeIterator(walkRoot);
        while (currentNode = nodeIterator.nextNode()) {
          _sanitizeElements(currentNode, walkRoot);
          _sanitizeAttributes(currentNode, walkRoot);
          if (_isDocumentFragment(currentNode.content)) _sanitizeShadowDOM2(currentNode.content);
        }
        if (inPlace) _sanitizeUnvisitedNodes(dirty2, inPlaceNodes);
      } catch (error) {
        if (inPlace) {
          _neutralizeRoot(dirty2);
          _neutralizeDiscarded(dirty2, inPlaceNodes);
        }
        throw error;
      } finally {
        IN_PLACE_VISITED = outerVisited;
      }
      if (inPlace) {
        if (_neutralizeDiscarded(dirty2, inPlaceNodes)) throw typeErrorCreate("a node selected for removal could not be safely returned; refusing to sanitize in place");
        if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(dirty2);
        return dirty2;
      }
      if (RETURN_DOM) {
        if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(body);
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);
          while (body.firstChild) returnNode.appendChild(body.firstChild);
        } else returnNode = body;
        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) returnNode = importNode.call(originalDocument, returnNode, true);
        return returnNode;
      }
      let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
      if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + ">\n" + serializedHTML;
      if (SAFE_FOR_TEMPLATES) serializedHTML = _stripTemplateExpressions(serializedHTML);
      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
    };
    DOMPurify.setConfig = function() {
      let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      _parseConfig(cfg);
      SET_CONFIG = true;
      SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
      SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
    };
    DOMPurify.clearConfig = function() {
      CONFIG = null;
      SET_CONFIG = false;
      SET_CONFIG_ALLOWED_TAGS = null;
      SET_CONFIG_ALLOWED_ATTR = null;
      trustedTypesPolicy = defaultTrustedTypesPolicy;
      emptyHTML = "";
    };
    DOMPurify.isValidAttribute = function(tag, attr, value) {
      if (!CONFIG) _parseConfig({});
      const lcTag = transformCaseFunc(tag);
      const lcName = transformCaseFunc(attr);
      if (typeof value === "string" && (_isUnsafeAttributeValue(attr, value) || !ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value))) return false;
      return _isValidAttribute(lcTag, lcName, value);
    };
    DOMPurify.addHook = function(entryPoint, hookFunction) {
      if (typeof hookFunction !== "function") return;
      if (!objectHasOwnProperty(hooks, entryPoint)) return;
      arrayPush(hooks[entryPoint], hookFunction);
    };
    DOMPurify.removeHook = function(entryPoint, hookFunction) {
      if (!objectHasOwnProperty(hooks, entryPoint)) return;
      if (hookFunction !== void 0) {
        const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
        return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
      }
      return arrayPop(hooks[entryPoint]);
    };
    DOMPurify.removeHooks = function(entryPoint) {
      if (!objectHasOwnProperty(hooks, entryPoint)) return;
      hooks[entryPoint] = [];
    };
    DOMPurify.removeAllHooks = function() {
      hooks = _createHooksMap();
    };
    return DOMPurify;
  }
  var purify_default = createDOMPurify();

  // src/notes.mjs
  var MARKDOWN_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "del", "blockquote", "pre", "code", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td", "input"];
  function markdownFragment(source) {
    const parsed = x.parse(source, { gfm: true, breaks: true, async: false });
    const fragment = purify_default.sanitize(parsed, { ALLOWED_TAGS: MARKDOWN_TAGS, ALLOWED_ATTR: ["href", "title", "type", "checked", "disabled", "start", "align"], RETURN_DOM_FRAGMENT: true });
    for (const anchor of fragment.querySelectorAll("a")) {
      const href = anchor.getAttribute("href");
      if (href && !/^(https?:|mailto:|#)/i.test(href)) {
        anchor.removeAttribute("href");
      }
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
    for (const input of fragment.querySelectorAll("input")) {
      input.type = "checkbox";
      input.disabled = true;
    }
    return fragment;
  }

  // src/audit.mjs
  function terminalMap(project) {
    const terminals = {};
    for (const name of ["VCC", "GND", "P+", "P-"]) {
      terminals[name] = name;
    }
    for (let index = 0; index < 24; index = index + 1) {
      terminals["K" + index] = "K" + index;
      terminals["L" + index] = "L" + index;
    }
    for (const chip of project.chips) {
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        terminals[chip.id + "-" + pin] = pinHole(chip, pin);
      }
    }
    return terminals;
  }
  function auditComplement(project) {
    const reference = complementPreset();
    const issues = [];
    for (const expected of reference.chips) {
      let found = false;
      for (const chip of project.chips) {
        if (chip.id === expected.id && chip.model === expected.model) {
          found = true;
        }
      }
      if (!found) {
        issues.push(expected.id + " \u5E94\u4E3A " + expected.model + "\uFF0C\u8BF7\u68C0\u67E5\u82AF\u7247\u578B\u53F7\u548C\u7F16\u53F7");
      }
    }
    if (project.chips.length !== reference.chips.length) {
      issues.push("\u6807\u51C6\u5B9E\u9A8C\u4F7F\u7528 5 \u7247\u82AF\u7247\uFF0C\u5F53\u524D\u6709 " + project.chips.length + " \u7247");
    }
    if (issues.length > 0) {
      return issues;
    }
    const actualTerminals = terminalMap(project);
    const expectedTerminals = terminalMap(reference);
    const actualTopology = buildTopology(project);
    const expectedTopology = buildTopology(reference);
    const names = Object.keys(expectedTerminals);
    for (let first = 0; first < names.length; first = first + 1) {
      for (let second = first + 1; second < names.length; second = second + 1) {
        const firstName = names[first];
        const secondName = names[second];
        const expectedSame = nodeFor(expectedTopology, expectedTerminals[firstName]) === nodeFor(expectedTopology, expectedTerminals[secondName]);
        const actualSame = nodeFor(actualTopology, actualTerminals[firstName]) === nodeFor(actualTopology, actualTerminals[secondName]);
        if (expectedSame !== actualSame) {
          let message = firstName + " \u4E0E " + secondName + " \u5E94\u5F53\u8FDE\u901A\uFF0C\u8BF7\u68C0\u67E5\u8FD9\u6761\u901A\u8DEF";
          if (actualSame) {
            message = firstName + " \u4E0E " + secondName + " \u88AB\u989D\u5916\u63A5\u901A\uFF0C\u8BF7\u68C0\u67E5\u76F8\u5173\u5BFC\u7EBF";
          }
          issues.push(message);
        }
      }
    }
    return issues;
  }

  // src/workspace.mjs
  var WORKSPACE_KEY = "breadboard-lab-workspace-v1";
  var READ_ONLY_KEY = "breadboard-lab-read-only";
  var CLEANUP_BACKUP_KEY = "sdu-breadboard-before-cleanup-v1";
  function isBlankExperiment(project) {
    if (project.chips.length > 0 || project.wires.length > 0 || project.pullUps.length > 0) {
      return false;
    }
    if (project.notes !== GENERAL_NOTES || project.inputCount !== 8 || project.outputCount !== 8 || !project.power) {
      return false;
    }
    for (const value of project.switches) {
      if (value !== 0) {
        return false;
      }
    }
    return true;
  }
  function findBlankExperiment(workspace2) {
    for (const id of Object.keys(workspace2.projects)) {
      if (isBlankExperiment(workspace2.projects[id])) {
        return id;
      }
    }
    return "";
  }
  function cleanWorkspace(workspace2) {
    const removed = [];
    let blank = "";
    const signatures = /* @__PURE__ */ new Map();
    const ids = Object.keys(workspace2.projects);
    if (ids.includes(workspace2.activeId)) {
      ids.splice(ids.indexOf(workspace2.activeId), 1);
      ids.unshift(workspace2.activeId);
    }
    for (const id of ids) {
      const project = workspace2.projects[id];
      let duplicate = "";
      if (isBlankExperiment(project)) {
        duplicate = blank;
        if (blank === "") {
          blank = id;
        }
      } else if (project.name === "\u53CC\u7B26\u53F7\u4F4D\u8865\u7801\u8FD0\u7B97\u5668") {
        const signature = JSON.stringify({ chips: project.chips, wires: project.wires, notes: project.notes, inputCount: project.inputCount, outputCount: project.outputCount, pullUps: project.pullUps });
        if (signatures.has(signature)) {
          duplicate = signatures.get(signature);
        } else {
          signatures.set(signature, id);
        }
      }
      if (duplicate !== "") {
        removed.push(id);
        delete workspace2.projects[id];
      }
    }
    return removed;
  }
  function newExperimentId() {
    return crypto.randomUUID();
  }
  function keepExperiment(workspace2, id, project) {
    workspace2.activeId = id;
    workspace2.projects[id] = copyProject(project);
  }
  function validateWorkspace(value) {
    if (!value || value.version !== 1 || typeof value.activeId !== "string" || !value.projects || typeof value.projects !== "object") {
      throw new Error("\u672C\u5730\u5B9E\u9A8C\u5217\u8868\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u5BFC\u5165\u4F60\u4FDD\u5B58\u7684\u5B9E\u9A8C\u6587\u4EF6");
    }
    const workspace2 = { version: 1, activeId: value.activeId, projects: {} };
    for (const id of Object.keys(value.projects)) {
      if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) {
        throw new Error("\u5B9E\u9A8C\u7F16\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5\u4FDD\u5B58\u6587\u4EF6");
      }
      workspace2.projects[id] = validateProject(value.projects[id]);
    }
    if (!Object.hasOwn(workspace2.projects, workspace2.activeId)) {
      throw new Error("\u5F53\u524D\u5B9E\u9A8C\u4E0D\u5728\u5217\u8868\u4E2D\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u5B9E\u9A8C");
    }
    return workspace2;
  }

  // src/version.mjs
  var APP_VERSION = "1.2.0";
  var CLOCK_SETTINGS = { timeZone: "Asia/Shanghai", hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };

  // src/app.mjs
  var SETTINGS = {
    historyLimit: 80,
    zoomMinimum: 0.15,
    zoomMaximum: 2,
    zoomStep: 0.15,
    wheelSpeed: 15e-4
  };
  var PULSE_SETTINGS = { feedbackDuration: 160 };
  var state = {
    project: emptyProject(),
    runtime: createRuntime(),
    result: null,
    tool: "wire",
    wireColor: WIRE_COLORS[1],
    selected: null,
    selection: [],
    pinnedChip: "",
    placing: "",
    pending: null,
    pointer: null,
    hovered: "",
    showInternals: false,
    showLevels: false,
    zoom: 1,
    targetZoom: 1,
    undo: [],
    redo: [],
    activeTab: "inspect",
    notesEditing: false,
    previousIssues: /* @__PURE__ */ new Set(),
    saveFailed: false,
    pressedPulse: "",
    visual: { switches: [], leds: {}, internals: 0 }
  };
  var endpoints = allEndpoints();
  var canvas = null;
  var zoomAnchor = null;
  var lastPinnedChip = "";
  var lastInputCount = 0;
  var boardTransitionFirst = null;
  var boardTransitionLast = null;
  var readOnly = false;
  var workspace = { version: 1, activeId: "", projects: {} };
  var activeExperiment = "";
  var wiringAudit = [];
  var dirty = false;
  var dirtyExperiments = /* @__PURE__ */ new Set();
  var savedExperiments = { version: 1, activeId: "", projects: {} };
  var autoSave = false;
  var confirmationAction = null;
  var drag = null;
  var ignoreClick = false;
  var cycle = { x: -100, y: -100, signature: "", index: 0 };
  var catalogModel = "";
  var heldPulse = "";
  var pulseTimer = 0;
  var recentAction = "";
  var routingBusy = false;
  var expandedSelection = /* @__PURE__ */ new Set();
  function updateClock() {
    element("app-version").textContent = "v" + APP_VERSION;
    element("current-time").textContent = new Intl.DateTimeFormat("zh-CN", CLOCK_SETTINGS).format(/* @__PURE__ */ new Date());
  }
  function stageChanges() {
    keepExperiment(workspace, activeExperiment, state.project);
    dirty = true;
    dirtyExperiments.add(activeExperiment);
    element("save-status").textContent = "\u6709\u672A\u4FDD\u5B58\u7684\u66F4\u6539";
    if (autoSave) {
      saveLocal();
    }
  }
  function saveCurrent() {
    saveLocal();
  }
  function changeAutoSave(event) {
    autoSave = event.currentTarget.checked;
    if (autoSave) {
      saveLocal();
    }
  }
  function beforeLeave(event) {
    if (dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  function confirmAction(title, message, action, acceptLabel = "\u786E\u8BA4\u5220\u9664", destructive = true) {
    confirmationAction = action;
    element("confirm-title").textContent = title;
    element("confirm-message").textContent = message;
    const accept = element("confirm-accept");
    accept.textContent = acceptLabel;
    accept.classList.toggle("danger", destructive);
    accept.classList.toggle("primary", !destructive);
    element("confirm-dialog").showModal();
    element("confirm-cancel").focus();
  }
  function cancelConfirmation() {
    confirmationAction = null;
    element("confirm-dialog").close();
  }
  function acceptConfirmation() {
    const action = confirmationAction;
    confirmationAction = null;
    element("confirm-dialog").close();
    if (action) {
      action();
    }
  }
  function deleteCurrentExperiment() {
    delete workspace.projects[activeExperiment];
    delete savedExperiments.projects[activeExperiment];
    dirtyExperiments.delete(activeExperiment);
    const ids = Object.keys(workspace.projects);
    if (ids.length === 0) {
      activeExperiment = newExperimentId();
      state.project = emptyProject();
    } else {
      activeExperiment = ids[0];
      state.project = copyProject(workspace.projects[activeExperiment]);
    }
    resetRuntime();
    state.undo = [];
    state.redo = [];
    commit();
    renderLibrary();
    if (Object.keys(savedExperiments.projects).length > 0) {
      savedExperiments.activeId = Object.keys(savedExperiments.projects)[0];
    } else {
      savedExperiments.activeId = activeExperiment;
      savedExperiments.projects[activeExperiment] = copyProject(state.project);
    }
    try {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(savedExperiments));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedExperiments.projects[savedExperiments.activeId]));
    } catch (error) {
      toast("\u5B9E\u9A8C\u5DF2\u4ECE\u5217\u8868\u79FB\u9664\uFF0C\u4F60\u53EF\u4EE5\u5728\u6D4F\u89C8\u5668\u5B58\u50A8\u6062\u590D\u540E\u4FDD\u5B58", "warning");
    }
  }
  function quickDelete() {
    if (editingLocked()) {
      return;
    }
    if (state.selection.length > 0 || state.selected && (state.selected.kind === "wire" || state.selected.kind === "chip")) {
      deleteSelected();
      return;
    }
    confirmAction("\u5220\u9664\u5F53\u524D\u5B9E\u9A8C\uFF1F", "\u4F60\u5C06\u5220\u9664\u201C" + state.project.name + "\u201D\u3002\u5176\u4ED6\u5B9E\u9A8C\u4F1A\u4FDD\u7559", deleteCurrentExperiment);
  }
  function editingLocked() {
    if (readOnly) {
      toast("\u5F53\u524D\u5B9E\u9A8C\u5904\u4E8E\u53EA\u8BFB\u6A21\u5F0F\u3002\u4F60\u53EF\u4EE5\u6D4B\u8BD5\u8F93\u5165\u8F93\u51FA\uFF1B\u7F16\u8F91\u63A5\u7EBF\u524D\uFF0C\u8BF7\u5173\u95ED\u6807\u9898\u680F\u7684\u53EA\u8BFB\u5F00\u5173", "info");
      return true;
    }
    return false;
  }
  function changeReadOnly(event) {
    readOnly = event.currentTarget.checked;
    state.pending = null;
    state.placing = "";
    state.notesEditing = false;
    state.tool = "select";
    lastPinnedChip = "";
    try {
      localStorage.setItem(READ_ONLY_KEY, String(readOnly));
    } catch (error) {
      toast("\u53EA\u8BFB\u72B6\u6001\u5DF2\u751F\u6548\uFF1B\u6D4F\u89C8\u5668\u6682\u65F6\u65E0\u6CD5\u8BB0\u4F4F\u8FD9\u4E2A\u8BBE\u7F6E", "warning");
    }
    renderLibrary();
    render();
  }
  function renderExperiments() {
    const picker = element("experiment-picker");
    picker.replaceChildren();
    for (const id of Object.keys(workspace.projects)) {
      let name = workspace.projects[id].name;
      if (id === activeExperiment) {
        name = state.project.name;
      }
      if (name.trim() === "") {
        name = "\u672A\u547D\u540D\u5B9E\u9A8C";
      }
      const option = node("option", name, "");
      option.value = id;
      picker.append(option);
    }
    picker.value = activeExperiment;
  }
  function switchExperiment(event) {
    keepExperiment(workspace, activeExperiment, state.project);
    const id = event.currentTarget.value;
    if (!Object.hasOwn(workspace.projects, id)) {
      return;
    }
    activeExperiment = id;
    state.project = copyProject(workspace.projects[id]);
    resetRuntime();
    state.undo = [];
    state.redo = [];
    wiringAudit = [];
    calculate(false);
    render();
    renderLibrary();
  }
  function auditCurrentWiring() {
    wiringAudit = auditComplement(state.project);
    state.activeTab = "diagnostics";
    if (wiringAudit.length === 0) {
      toast("\u5F53\u524D\u82AF\u7247\u548C\u7535\u6C14\u8FDE\u63A5\u4E0E\u8865\u7801\u5B9E\u9A8C\u6807\u51C6\u63A5\u6CD5\u4E00\u81F4", "info");
    } else {
      toast("\u53D1\u73B0\u63A5\u7EBF\u5DEE\u5F02\uFF1A" + wiringAudit[0] + " \u4F60\u53EF\u4EE5\u5728\u8BCA\u65AD\u9762\u677F\u67E5\u770B\u8BE6\u60C5", "warning");
    }
    render();
  }
  function requestWireRouting() {
    if (editingLocked()) {
      return;
    }
    if (routingBusy) {
      return;
    }
    if (state.project.wires.length === 0) {
      toast("\u5F53\u524D\u5B9E\u9A8C\u8FD8\u6CA1\u6709\u5BFC\u7EBF", "info");
      return;
    }
    confirmAction("\u6574\u7406\u8D70\u7EBF\uFF1F", "\u7A0B\u5E8F\u4F1A\u8C03\u6574\u5F53\u524D\u7535\u8DEF\u7684\u5BFC\u7EBF\u8DEF\u5F84\uFF0C\u7ED5\u5F00\u82AF\u7247\u5E76\u51CF\u5C11\u91CD\u53E0\uFF1B\u63A5\u7EBF\u7AEF\u70B9\u3001\u7EBF\u8272\u548C\u5907\u6CE8\u4FDD\u6301\u4E0D\u53D8\u3002\u624B\u52A8\u8F6C\u6298\u70B9\u5C06\u88AB\u66FF\u6362\uFF0C\u4F60\u53EF\u4EE5\u64A4\u9500\u8FD9\u6B21\u6574\u7406", applyWireRouting, "\u786E\u8BA4\u6574\u7406", false);
  }
  async function applyWireRouting() {
    const experiment = activeExperiment;
    const signature = JSON.stringify(state.project);
    const candidate = copyProject(state.project);
    routingBusy = true;
    render();
    try {
      if (!restorePresetRoutes(candidate)) {
        const routes = await routeWires(candidate);
        for (const wire of candidate.wires) {
          wire.bends = routes[wire.id];
        }
      }
      if (activeExperiment !== experiment || JSON.stringify(state.project) !== signature || readOnly) {
        toast("\u5B9E\u9A8C\u5DF2\u5207\u6362\u6216\u4FEE\u6539\uFF0C\u672C\u6B21\u6574\u7406\u7ED3\u679C\u672A\u5E94\u7528", "info");
        return;
      }
      validateProject(candidate);
      remember();
      state.project = candidate;
      state.pending = null;
      state.placing = "";
      state.tool = "select";
      commit();
      toast("\u8D70\u7EBF\u5DF2\u6574\u7406\uFF0C\u7535\u6C14\u8FDE\u63A5\u4FDD\u6301\u4E0D\u53D8", "info");
    } catch (error) {
      toast("\u539F\u63A5\u7EBF\u5DF2\u4FDD\u7559\uFF0C" + error.message, "warning");
    } finally {
      routingBusy = false;
      render();
    }
  }
  function toast(message, kind) {
    showToast(message, kind);
    recentAction = message;
    updateActionStatus();
  }
  function remember() {
    state.undo.push(copyProject(state.project));
    if (state.undo.length > SETTINGS.historyLimit) {
      state.undo.shift();
    }
    state.redo = [];
  }
  function saveLocal() {
    try {
      keepExperiment(workspace, activeExperiment, state.project);
      const nextSaved = copyProject(savedExperiments);
      keepExperiment(nextSaved, activeExperiment, state.project);
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(nextSaved));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
      savedExperiments = nextSaved;
      dirtyExperiments.delete(activeExperiment);
      dirty = dirtyExperiments.size > 0;
      element("save-status").textContent = "\u5F53\u524D\u5B9E\u9A8C\u5DF2\u4FDD\u5B58";
      state.saveFailed = false;
    } catch (error) {
      element("save-status").textContent = "\u672C\u5730\u4FDD\u5B58\u4E0D\u53EF\u7528";
      if (!state.saveFailed) {
        toast("\u6D4F\u89C8\u5668\u65E0\u6CD5\u4FDD\u5B58\u7535\u8DEF\uFF0C\u8BF7\u4F7F\u7528\u5BFC\u51FA\u6309\u94AE\u4FDD\u7559\u6587\u4EF6", "warning");
        state.saveFailed = true;
      }
    }
  }
  function calculate(notify) {
    state.result = simulate(state.project, state.runtime);
    const current = /* @__PURE__ */ new Set();
    const newIssues = [];
    for (const issue of state.result.issues) {
      const identity = issue.code + ":" + issue.message;
      current.add(identity);
      if (!state.previousIssues.has(identity)) {
        newIssues.push(issue);
      }
    }
    if (notify && newIssues.length > 0) {
      let message = newIssues[0].message;
      if (newIssues.length > 1) {
        message = message + " \u53E6\u6709 " + (newIssues.length - 1) + " \u9879\u95EE\u9898\uFF0C\u8BE6\u89C1\u8BCA\u65AD";
      }
      let kind = "error";
      if (newIssues[0].severity === "warning") {
        kind = "warning";
      }
      toast(message, kind);
    }
    state.previousIssues = current;
    animateBoard();
  }
  function targetVisuals() {
    const switches = [];
    const leds = {};
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      switches.push(state.project.switches[index]);
      for (const prefix of ["K", "L"]) {
        const name = prefix + index;
        leds[name] = 0;
        if (readEndpoint(state.result, name) === 1) {
          leds[name] = 1;
        }
      }
    }
    let internals = 0;
    if (state.showInternals) {
      internals = 1;
    }
    return { switches, leds, internals };
  }
  function updateBoardTransition(progress) {
    const visual = { switches: [], leds: {}, internals: 0 };
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      const first = boardTransitionFirst.switches[index];
      const last = boardTransitionLast.switches[index];
      visual.switches.push(first + (last - first) * progress);
      for (const prefix of ["K", "L"]) {
        const name = prefix + index;
        const initial = boardTransitionFirst.leds[name];
        const target = boardTransitionLast.leds[name];
        visual.leds[name] = initial + (target - initial) * progress;
      }
    }
    visual.internals = boardTransitionFirst.internals + (boardTransitionLast.internals - boardTransitionFirst.internals) * progress;
    state.visual = visual;
    renderBoard(canvas, state, endpoints);
  }
  function animateBoard() {
    const target = targetVisuals();
    if (state.visual.switches.length === 0) {
      state.visual = target;
      return;
    }
    boardTransitionFirst = state.visual;
    boardTransitionLast = target;
    tween("board", 0, 1, updateBoardTransition, MOTION.duration);
  }
  function commit() {
    wiringAudit = [];
    calculate(true);
    stageChanges();
    render();
  }
  function nextId(items, prefix) {
    let maximum = 0;
    for (const item of items) {
      const number = Number(item.id.slice(1));
      maximum = Math.max(maximum, number);
    }
    return prefix + (maximum + 1);
  }
  function occupied(name) {
    for (const chip of state.project.chips) {
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        if (pinHole(chip, pin) === name) {
          return true;
        }
      }
    }
    for (const wire of state.project.wires) {
      if (wire.from === name || wire.to === name) {
        return true;
      }
    }
    return false;
  }
  function connectWire(first, second, bends) {
    if (editingLocked()) {
      return false;
    }
    if (!validEndpoint(first) || !validEndpoint(second)) {
      toast("\u7AEF\u70B9\u540D\u79F0\u4E0D\u6B63\u786E\uFF0C\u8BF7\u9009\u62E9\u63D2\u5B54\u6216\u68C0\u67E5\u7AEF\u70B9\u540D\u79F0", "error");
      return false;
    }
    if (first === second) {
      toast("\u5BFC\u7EBF\u4E24\u7AEF\u4E0D\u80FD\u662F\u540C\u4E00\u4E2A\u5B54", "warning");
      return false;
    }
    if (occupied(first) || occupied(second)) {
      toast("\u8FD9\u4E2A\u5B54\u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u8FDE\u63A5\u540C\u5217\u4E94\u5B54\u7EC4\u4E2D\u7684\u5176\u4ED6\u7A7A\u5B54", "warning");
      return false;
    }
    if (state.project.wires.length >= LIMITS.wires) {
      toast("\u5BFC\u7EBF\u6570\u91CF\u5DF2\u8FBE\u5230\u6B64\u7248\u672C\u7684\u4E0A\u9650", "error");
      return false;
    }
    remember();
    state.project.wires.push({ id: nextId(state.project.wires, "W"), from: first, to: second, color: state.wireColor, bends });
    state.pending = null;
    commit();
    return true;
  }
  function renderLibrary() {
    const container = element("chip-library");
    container.replaceChildren();
    const query = element("chip-search").value.toUpperCase().trim();
    let count = 0;
    for (const model in CHIP_MODELS) {
      if (!model.includes(query)) {
        continue;
      }
      const specification = CHIP_MODELS[model];
      const button = node("button", "", "chip-option");
      if (catalogModel === model) {
        button.classList.add("active");
      }
      button.dataset.model = model;
      button.setAttribute("aria-label", "\u67E5\u770B " + model + " " + specification.title);
      button.setAttribute("aria-pressed", String(catalogModel === model));
      const description = node("span", "", "");
      const subtitle = node("small", "", "");
      subtitle.append(document.createTextNode(specification.title + " \xB7 "), node("span", "DIP-" + specification.count, "chip-package"));
      description.append(node("strong", model, ""), subtitle);
      button.append(icon("microchip"), description);
      button.addEventListener("click", chooseChip);
      container.append(button);
      count = count + 1;
    }
    element("model-count").textContent = String(count);
    if (count === 0) {
      container.append(node("p", "\u6CA1\u6709\u5339\u914D\u7684\u82AF\u7247", "empty-inspector"));
    }
    refreshIcons();
  }
  function chooseChip(event) {
    const model = event.currentTarget.dataset.model;
    if (catalogModel === model) {
      catalogModel = "";
      state.placing = "";
      if (state.tool === "place") {
        state.tool = "select";
      }
      renderLibrary();
      render();
      return;
    }
    catalogModel = model;
    state.placing = "";
    if (!readOnly) {
      state.placing = model;
    }
    ignoreClick = false;
    drag = null;
    state.selected = null;
    state.selection = [];
    state.pinnedChip = "";
    state.pending = null;
    state.tool = "place";
    if (readOnly) {
      state.tool = "select";
    }
    state.activeTab = "inspect";
    renderLibrary();
    render();
  }
  function placeCatalogChip() {
    if (editingLocked() || catalogModel === "") {
      return;
    }
    state.placing = catalogModel;
    state.tool = "place";
    ignoreClick = false;
    state.pending = null;
    render();
  }
  function placeChip(point) {
    if (editingLocked()) {
      return;
    }
    let section = Math.floor((point.y - BOARD.startY + 30) / BOARD.sectionHeight);
    let column = Math.round((point.x - BOARD.startX) / BOARD.pitch) + 1;
    const chip = { id: nextId(state.project.chips, "U"), model: state.placing, section, column };
    let error = placementError(state.project.chips, chip, "");
    if (state.project.chips.length >= LIMITS.chips) {
      error = "\u82AF\u7247\u6570\u91CF\u5DF2\u8FBE\u5230\u6B64\u7248\u672C\u7684\u4E0A\u9650";
    }
    if (error === "") {
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        if (occupied(pinHole(chip, pin))) {
          error = "\u82AF\u7247\u5F15\u811A\u4F4D\u7F6E\u5DF2\u6709\u5BFC\u7EBF\uFF0C\u8BF7\u6362\u4E00\u7EC4\u7A7A\u5217";
        }
      }
    }
    if (error !== "") {
      toast(error, "error");
      return;
    }
    remember();
    state.project.chips.push(chip);
    catalogModel = "";
    selectTarget({ kind: "chip", id: chip.id }, false);
    state.placing = "";
    state.tool = "select";
    renderLibrary();
    commit();
  }
  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width * BOARD.width, y: (event.clientY - bounds.top) / bounds.height * BOARD.height };
  }
  function clickBoard(event) {
    if (ignoreClick) {
      ignoreClick = false;
      return;
    }
    const point = canvasPoint(event);
    if (state.placing !== "") {
      placeChip(point);
      return;
    }
    const target = cycleTarget(point);
    if (target && target.kind === "switch") {
      toggleSwitch(target.id);
      return;
    }
    if (target && target.kind === "pulse") {
      pulse(target.id);
      return;
    }
    if (readOnly) {
      selectTarget(target, event.ctrlKey || event.metaKey);
      render();
      return;
    }
    if (state.tool === "delete") {
      if (target && (target.kind === "wire" || target.kind === "chip")) {
        confirmAction("\u5220\u9664\u5BF9\u8C61\uFF1F", "\u786E\u8BA4\u5220\u9664 " + target.id + "\uFF1F", removeTargets.bind(null, [target]));
      }
      return;
    }
    if (target && target.kind === "node" && state.tool === "wire") {
      if (occupied(target.id)) {
        state.selected = target;
        toast("\u6B64\u5B54\u5DF2\u5360\u7528\uFF0C\u63A5\u7EBF\u8BF7\u9009\u540C\u5217\u7684\u5176\u4ED6\u7A7A\u5B54", "warning");
      } else if (!state.pending) {
        state.pending = { from: target.id, bends: [] };
        state.selected = target;
      } else {
        connectWire(state.pending.from, target.id, state.pending.bends);
      }
    } else if (state.pending && (!target || target.kind === "wire")) {
      if (state.pending.bends.length >= LIMITS.bends) {
        toast("\u8FD9\u6839\u7EBF\u7684\u8F6C\u6298\u70B9\u8FC7\u591A\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u63A5\u7EBF", "warning");
      } else {
        state.pending.bends.push({ x: Math.round(point.x), y: Math.round(point.y) });
      }
    } else {
      selectTarget(target, event.ctrlKey || event.metaKey);
    }
    render();
  }
  function cycleTarget(point) {
    const candidates = hitCandidates(point, state, endpoints);
    let signature = "";
    for (const target of candidates) {
      signature = signature + target.kind + ":" + target.id + ";";
    }
    if (Math.hypot(point.x - cycle.x, point.y - cycle.y) < 7 && signature === cycle.signature && candidates.length > 1) {
      cycle.index = (cycle.index + 1) % candidates.length;
    } else {
      cycle.index = 0;
    }
    cycle.x = point.x;
    cycle.y = point.y;
    cycle.signature = signature;
    if (candidates.length === 0) {
      return null;
    }
    return candidates[cycle.index];
  }
  function selectTarget(target, multiple) {
    catalogModel = "";
    const same = target && state.selected && target.kind === state.selected.kind && target.id === state.selected.id;
    if (same && !multiple) {
      if (target.kind === "chip" && state.pinnedChip === target.id) {
        state.pinnedChip = "";
      }
      state.selected = null;
      state.selection = [];
      return;
    }
    if (multiple && state.selection.length === 0 && state.selected && (state.selected.kind === "wire" || state.selected.kind === "chip")) {
      state.selection.push({ kind: state.selected.kind, id: state.selected.id });
    }
    state.selected = target;
    if (!multiple) {
      state.selection = [];
    }
    if (!target) {
      return;
    }
    if (target.kind === "chip" || target.kind === "wire") {
      let position = -1;
      for (let index = 0; index < state.selection.length; index = index + 1) {
        if (state.selection[index].kind === target.kind && state.selection[index].id === target.id) {
          position = index;
        }
      }
      if (multiple && position >= 0) {
        state.selection.splice(position, 1);
        if (target.kind === "chip" && state.pinnedChip === target.id) {
          state.pinnedChip = "";
        }
        state.selected = null;
        if (state.selection.length > 0) {
          state.selected = state.selection[state.selection.length - 1];
        }
        return;
      } else if (position < 0) {
        state.selection.push({ kind: target.kind, id: target.id });
      }
    }
    if (target.kind === "chip") {
      state.pinnedChip = target.id;
      state.activeTab = "inspect";
      lastPinnedChip = "";
    }
  }
  function pointerDown(event) {
    if (state.placing !== "" || state.tool === "place") {
      return;
    }
    const target = hitTest(canvasPoint(event), state, endpoints);
    if (target && target.kind === "pulse" && event.button === 0) {
      startPulse(target.id);
      canvas.setPointerCapture(event.pointerId);
      return;
    }
    if (state.tool !== "select" || readOnly || event.ctrlKey || event.metaKey || event.button !== 0) {
      return;
    }
    const point = canvasPoint(event);
    const handle = wireHandleAt(point, state.project, state.selected);
    if (handle) {
      drag = { wire: handle.wire, handle: handle.handle, points: handle.points, origin: point, moved: false, original: copyProject(state.project) };
      canvas.setPointerCapture(event.pointerId);
    }
  }
  function dragPointer(event) {
    if (!drag) {
      return;
    }
    const point = canvasPoint(event);
    if (!drag.moved && Math.hypot(point.x - drag.origin.x, point.y - drag.origin.y) <= 4) {
      return;
    }
    drag.moved = true;
    const wire = findWire(drag.wire);
    if (drag.handle > 0 && drag.handle < drag.points.length - 1) {
      const bends = [];
      for (let index = 1; index < drag.points.length - 1; index = index + 1) {
        let location = drag.points[index];
        if (index === drag.handle) {
          location = { x: Math.round(point.x), y: Math.round(point.y) };
        }
        bends.push(location);
      }
      wire.bends = bends;
    }
    renderBoard(canvas, state, endpoints);
  }
  function pointerUp(event) {
    if (heldPulse !== "") {
      finishPulse();
      ignoreClick = true;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      return;
    }
    if (!drag) {
      return;
    }
    const current = drag;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (!current.moved) {
      return;
    }
    ignoreClick = true;
    const wire = findWire(current.wire);
    const end = current.handle === 0 || current.handle === current.points.length - 1;
    if (end) {
      const name = nearestEndpoint(canvasPoint(event), endpoints);
      let previous = wire.from;
      if (current.handle !== 0) {
        previous = wire.to;
      }
      if (name === "" || occupied(name) && name !== previous) {
        state.project = current.original;
        toast("\u8BF7\u628A\u7AEF\u70B9\u62D6\u5230\u4E00\u4E2A\u7A7A\u63D2\u5B54\uFF0C\u539F\u63A5\u7EBF\u5DF2\u4FDD\u7559", "warning");
        render();
        return;
      }
      if (current.handle === 0) {
        wire.from = name;
      } else {
        wire.to = name;
      }
    }
    state.undo.push(current.original);
    state.redo = [];
    commit();
  }
  function cancelPointer() {
    finishPulse();
    if (drag && drag.moved) {
      state.project = drag.original;
    }
    drag = null;
    renderBoard(canvas, state, endpoints);
  }
  function movePointer(event) {
    if (drag) {
      dragPointer(event);
      return;
    }
    const point = canvasPoint(event);
    state.pointer = point;
    const target = hitTest(point, state, endpoints);
    state.hovered = "";
    if (target && target.kind === "node") {
      state.hovered = target.id;
      const value = readEndpoint(state.result, target.id);
      element("pointer-status").textContent = endpointLabel(target.id) + " \xB7 " + value;
      canvas.title = endpointLabel(target.id) + "\uFF1A" + value;
    } else if (target && target.kind === "chip") {
      element("pointer-status").textContent = target.id;
      canvas.title = target.id;
    } else {
      element("pointer-status").textContent = "\u9762\u5305\u677F";
      canvas.title = "";
    }
    renderBoard(canvas, state, endpoints);
  }
  function leaveBoard() {
    state.hovered = "";
    state.pointer = null;
    renderBoard(canvas, state, endpoints);
  }
  function cancelWire() {
    state.pending = null;
    state.placing = "";
    catalogModel = "";
    if (state.tool === "place") {
      state.tool = "select";
    }
    renderLibrary();
    render();
  }
  function chooseTool(event) {
    if (event.currentTarget.id === "tool-place") {
      if (catalogModel === "") {
        toast("\u8BF7\u5148\u4ECE\u5DE6\u4FA7\u5668\u4EF6\u5E93\u9009\u62E9\u82AF\u7247", "info");
        return;
      }
      placeCatalogChip();
      return;
    }
    state.tool = event.currentTarget.id.slice(5);
    state.pending = null;
    state.placing = "";
    renderLibrary();
    render();
  }
  function createPalette() {
    const container = element("wire-palette");
    for (const color of WIRE_COLORS) {
      const button = node("button", "", "swatch");
      button.style.backgroundColor = color;
      button.dataset.color = color;
      button.title = "\u5BFC\u7EBF\u989C\u8272 " + color;
      button.setAttribute("aria-label", "\u5BFC\u7EBF\u989C\u8272 " + color);
      button.addEventListener("click", chooseColor);
      container.append(button);
    }
  }
  function chooseColor(event) {
    setWireColor(event.currentTarget.dataset.color);
  }
  function chooseCustomColor(event) {
    setWireColor(event.currentTarget.value);
  }
  function setWireColor(color) {
    const wires = [];
    if (state.selection.length > 0) {
      for (const target of state.selection) {
        if (target.kind === "wire") {
          const wire = findWire(target.id);
          if (wire && wire.color !== color) {
            wires.push(wire);
          }
        }
      }
    } else if (state.selected && state.selected.kind === "wire") {
      const wire = findWire(state.selected.id);
      if (wire && wire.color !== color) {
        wires.push(wire);
      }
    }
    if (wires.length > 0) {
      if (editingLocked()) {
        return;
      }
      remember();
      for (const wire of wires) {
        wire.color = color;
      }
      stageChanges();
    }
    state.wireColor = color;
    render();
  }
  function findWire(id) {
    for (const wire of state.project.wires) {
      if (wire.id === id) {
        return wire;
      }
    }
    return null;
  }
  function findChip(id) {
    for (const chip of state.project.chips) {
      if (chip.id === id) {
        return chip;
      }
    }
    return null;
  }
  function deleteSelected() {
    if (editingLocked()) {
      return;
    }
    const targets = [];
    for (const target of state.selection) {
      targets.push({ kind: target.kind, id: target.id });
    }
    if (targets.length === 0 && state.selected && (state.selected.kind === "chip" || state.selected.kind === "wire")) {
      targets.push({ kind: state.selected.kind, id: state.selected.id });
    }
    if (targets.length > 0) {
      confirmAction("\u5220\u9664\u9009\u4E2D\u7684\u5BF9\u8C61\uFF1F", "\u4F60\u9009\u4E2D\u4E86 " + targets.length + " \u4E2A\u5BF9\u8C61\uFF0C\u786E\u8BA4\u540E\u5C06\u4ECE\u5F53\u524D\u5B9E\u9A8C\u4E2D\u79FB\u9664", removeTargets.bind(null, targets));
    }
  }
  function removeTargets(targets) {
    remember();
    const wires = [];
    const chips = [];
    const removed = /* @__PURE__ */ new Set();
    for (const target of targets) {
      removed.add(target.kind + ":" + target.id);
    }
    for (const wire of state.project.wires) {
      if (!removed.has("wire:" + wire.id)) {
        wires.push(wire);
      }
    }
    for (const chip of state.project.chips) {
      if (!removed.has("chip:" + chip.id)) {
        chips.push(chip);
      } else {
        delete state.runtime.registers[chip.id];
        delete state.runtime.devices[chip.id];
      }
    }
    state.project.wires = wires;
    state.project.chips = chips;
    state.selected = null;
    state.selection = [];
    commit();
  }
  function deletePinnedChip() {
    if (findChip(state.pinnedChip)) {
      const target = { kind: "chip", id: state.pinnedChip };
      confirmAction("\u5220\u9664\u82AF\u7247\uFF1F", "\u786E\u8BA4\u5220\u9664 " + target.id + "\uFF1F\u5BFC\u7EBF\u4F1A\u7559\u5728\u539F\u6765\u7684\u63D2\u5B54", removeTargets.bind(null, [target]));
    }
  }
  function toggleSwitch(index) {
    remember();
    if (state.project.switches[index] === 0) {
      state.project.switches[index] = 1;
    } else {
      state.project.switches[index] = 0;
    }
    commit();
  }
  function clickQuickSwitch(event) {
    toggleSwitch(Number(event.currentTarget.dataset.bit));
  }
  function startPulse(kind) {
    if (!state.project.power) {
      toast("\u7535\u6E90\u5DF2\u5173\u95ED\uFF0C\u8BF7\u5148\u6253\u5F00\u7535\u6E90\u518D\u53D1\u8109\u51B2", "warning");
      return;
    }
    if (heldPulse !== "") {
      return;
    }
    window.clearTimeout(pulseTimer);
    heldPulse = kind;
    state.pressedPulse = kind;
    if (kind === "P+") {
      state.runtime.pulses.positive = 1;
    } else {
      state.runtime.pulses.negative = 0;
    }
    calculate(true);
    render();
  }
  function finishPulse() {
    if (heldPulse === "") {
      return;
    }
    const kind = heldPulse;
    heldPulse = "";
    state.runtime.pulses.positive = 0;
    state.runtime.pulses.negative = 1;
    calculate(true);
    recentAction = kind + " \u5355\u8109\u51B2\u5DF2\u5B8C\u6210";
    render();
    pulseTimer = window.setTimeout(clearPulseFeedback, PULSE_SETTINGS.feedbackDuration);
  }
  function clearPulseFeedback() {
    state.pressedPulse = "";
    render();
  }
  function pulse(kind) {
    startPulse(kind);
    finishPulse();
  }
  function pressPulseButton(event) {
    startPulse(event.currentTarget.dataset.pulse);
    if (heldPulse !== "") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }
  function releasePulseButton() {
    finishPulse();
  }
  function clickPulseButton(event) {
    if (event.detail === 0) {
      pulse(event.currentTarget.dataset.pulse);
    }
  }
  function changePower(event) {
    remember();
    state.project.power = event.currentTarget.checked;
    commit();
  }
  function undoEdit() {
    if (editingLocked()) {
      return;
    }
    if (state.undo.length === 0) {
      return;
    }
    state.redo.push(copyProject(state.project));
    state.project = state.undo.pop();
    resetRuntime();
    commit();
  }
  function redoEdit() {
    if (editingLocked()) {
      return;
    }
    if (state.redo.length === 0) {
      return;
    }
    state.undo.push(copyProject(state.project));
    state.project = state.redo.pop();
    resetRuntime();
    commit();
  }
  function resetRuntime() {
    heldPulse = "";
    state.pressedPulse = "";
    window.clearTimeout(pulseTimer);
    state.runtime = createRuntime();
    state.pending = null;
    state.placing = "";
    if (state.tool === "place") {
      state.tool = "select";
    }
    state.selected = null;
    catalogModel = "";
    state.selection = [];
    state.pinnedChip = "";
    lastPinnedChip = "";
    state.previousIssues = /* @__PURE__ */ new Set();
  }
  function newProject() {
    keepExperiment(workspace, activeExperiment, state.project);
    const blank = findBlankExperiment(workspace);
    if (blank !== "") {
      activeExperiment = blank;
      state.project = copyProject(workspace.projects[blank]);
      resetRuntime();
      calculate(false);
      render();
      toast("\u5DF2\u5207\u6362\u5230\u73B0\u6709\u7684\u7A7A\u767D\u5B9E\u9A8C\u3002\u4F60\u5F00\u59CB\u7F16\u8F91\u540E\uFF0C\u53EF\u4EE5\u518D\u65B0\u5EFA\u4E0B\u4E00\u4EFD", "info");
      return;
    }
    activeExperiment = newExperimentId();
    state.project = emptyProject();
    state.project.name = "\u7A7A\u767D\u5B9E\u9A8C " + (Object.keys(workspace.projects).length + 1);
    resetRuntime();
    state.undo = [];
    state.redo = [];
    wiringAudit = [];
    commit();
    renderLibrary();
  }
  function loadPreset() {
    keepExperiment(workspace, activeExperiment, state.project);
    for (const id of Object.keys(workspace.projects)) {
      if (workspace.projects[id].name === "\u53CC\u7B26\u53F7\u4F4D\u8865\u7801\u8FD0\u7B97\u5668" && auditComplement(workspace.projects[id]).length === 0) {
        activeExperiment = id;
        state.project = copyProject(workspace.projects[id]);
        resetRuntime();
        calculate(false);
        render();
        return;
      }
    }
    activeExperiment = newExperimentId();
    state.project = complementPreset();
    resetRuntime();
    state.undo = [];
    state.redo = [];
    wiringAudit = [];
    commit();
    renderLibrary();
  }
  function renameProject(event) {
    if (editingLocked()) {
      render();
      return;
    }
    state.project.name = event.currentTarget.value;
    stageChanges();
    renderExperiments();
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(revokeDownload.bind(null, url), 1e3);
  }
  function revokeDownload(url) {
    URL.revokeObjectURL(url);
  }
  function exportProject() {
    const content = JSON.stringify(state.project, null, 2);
    download(new Blob([content], { type: "application/json" }), "breadboard-circuit.json");
  }
  function exportWorkspace() {
    keepExperiment(workspace, activeExperiment, state.project);
    download(new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" }), "sdu-breadboard-workspace.json");
  }
  function chooseImport() {
    element("import-file").click();
  }
  async function importProject(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    if (!file) {
      return;
    }
    try {
      if (file.size > LIMITS.fileBytes) {
        throw new Error("\u7535\u8DEF\u6587\u4EF6\u8FC7\u5927\uFF0C\u8BF7\u9009\u62E9\u5C0F\u4E8E 2 MB \u7684\u6587\u4EF6");
      }
      const content = await file.text();
      const parsed = JSON.parse(content);
      if (parsed.projects) {
        keepExperiment(workspace, activeExperiment, state.project);
        const imported = validateWorkspace(parsed);
        for (const id of Object.keys(imported.projects)) {
          workspace.projects[newExperimentId()] = imported.projects[id];
        }
        cleanWorkspace(workspace);
        stageChanges();
        render();
        toast("\u5B9E\u9A8C\u5907\u4EFD\u5DF2\u5BFC\u5165\u3002\u4F60\u53EF\u4EE5\u5728\u201C\u6211\u7684\u5B9E\u9A8C\u201D\u4E2D\u5207\u6362\uFF0C\u6309 Ctrl+S \u4FDD\u5B58", "info");
        input.value = "";
        return;
      }
      const candidate = validateProject(parsed);
      keepExperiment(workspace, activeExperiment, state.project);
      activeExperiment = newExperimentId();
      state.project = candidate;
      resetRuntime();
      state.undo = [];
      state.redo = [];
      wiringAudit = [];
      commit();
      renderLibrary();
    } catch (error) {
      let message = "\u7535\u8DEF\u6587\u4EF6\u65E0\u6CD5\u89E3\u6790\uFF0C\u8BF7\u68C0\u67E5 JSON \u683C\u5F0F";
      if (!(error instanceof SyntaxError)) {
        message = error.message;
      }
      toast(message, "error");
    }
    input.value = "";
  }
  function receiveImage(blob) {
    if (!blob) {
      toast("\u65E0\u6CD5\u5BFC\u51FA\u56FE\u7247\uFF0C\u8BF7\u91CD\u8BD5", "error");
      return;
    }
    download(blob, "breadboard-wiring.png");
  }
  function exportImage() {
    canvas.toBlob(receiveImage, "image/png");
  }
  function applyZoom(value) {
    state.zoom = Math.max(SETTINGS.zoomMinimum, Math.min(SETTINGS.zoomMaximum, value));
    element("canvas-size").style.width = BOARD.width * state.zoom + "px";
    element("canvas-size").style.height = BOARD.height * state.zoom + "px";
    canvas.style.transform = "scale(" + state.zoom + ")";
    element("zoom-label").textContent = Math.round(state.zoom * 100) + "%";
    if (zoomAnchor) {
      const viewport = element("board-viewport");
      const bounds = canvas.getBoundingClientRect();
      viewport.scrollLeft = viewport.scrollLeft + bounds.left + zoomAnchor.x * state.zoom - zoomAnchor.clientX;
      viewport.scrollTop = viewport.scrollTop + bounds.top + zoomAnchor.y * state.zoom - zoomAnchor.clientY;
    }
  }
  function changeZoom(value, anchor) {
    zoomAnchor = anchor;
    state.targetZoom = Math.max(SETTINGS.zoomMinimum, Math.min(SETTINGS.zoomMaximum, value));
    tween("zoom", state.zoom, state.targetZoom, applyZoom, MOTION.zoomDuration);
  }
  function wheelBoard(event) {
    if (!event.ctrlKey) {
      return;
    }
    event.preventDefault();
    const bounds = canvas.getBoundingClientRect();
    const anchor = { x: (event.clientX - bounds.left) / state.zoom, y: (event.clientY - bounds.top) / state.zoom, clientX: event.clientX, clientY: event.clientY };
    let delta = event.deltaY;
    if (event.deltaMode === 1) {
      delta = delta * 16;
    } else if (event.deltaMode === 2) {
      delta = delta * element("board-viewport").clientHeight;
    }
    const scale = Math.exp(-delta * SETTINGS.wheelSpeed);
    changeZoom(state.targetZoom * scale, anchor);
  }
  function fitBoard() {
    const width2 = element("board-viewport").clientWidth - 36;
    changeZoom(width2 / BOARD.width, null);
  }
  function zoomIn() {
    changeZoom(state.targetZoom + SETTINGS.zoomStep, null);
  }
  function zoomOut() {
    changeZoom(state.targetZoom - SETTINGS.zoomStep, null);
  }
  function changeDisplayOptions() {
    state.showInternals = element("show-internals").checked;
    state.showLevels = element("show-levels").checked;
    animateBoard();
  }
  function connectByName() {
    const first = element("from-endpoint").value.trim();
    const second = element("to-endpoint").value.trim();
    connectWire(first, second, []);
  }
  function changeTab(event) {
    state.activeTab = event.currentTarget.id.slice(4);
    renderPanels();
    fadeContent(element(state.activeTab + "-panel"));
  }
  function appendPinRow(table, chip, pin) {
    const model = CHIP_MODELS[chip.model];
    const row = document.createElement("tr");
    const hole = pinHole(chip, pin);
    const value = readEndpoint(state.result, hole);
    row.append(node("td", String(pin), ""), node("td", model.labels[pin], ""));
    let levelClass = "logic-level";
    if (value === 1) {
      levelClass = levelClass + " high";
    } else if (value === "X" || value === "Z") {
      levelClass = levelClass + " unknown";
    }
    const levelCell = node("td", String(value), levelClass);
    levelCell.dataset.pin = String(pin);
    row.append(levelCell);
    const positionCell = document.createElement("td");
    const button = node("button", endpointLabel(hole), "");
    button.dataset.endpoint = hole;
    button.addEventListener("click", inspectPin);
    positionCell.append(button);
    row.append(positionCell);
    table.append(row);
  }
  function inspectPin(event) {
    state.selected = { kind: "node", id: event.currentTarget.dataset.endpoint };
    state.selection = [];
    render();
  }
  function renderChipPanel(container, chip) {
    const heading = node("div", "", "inspection-heading");
    heading.append(node("h2", chip.id + " \xB7 " + chip.model, ""));
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "\u5220\u9664\u82AF\u7247");
    remove.append(icon("trash-2"));
    remove.addEventListener("click", deletePinnedChip);
    heading.append(remove);
    const unpin = node("button", "", "icon-button");
    unpin.setAttribute("aria-label", "\u53D6\u6D88\u56FA\u5B9A\u5F15\u811A\u4FE1\u606F");
    unpin.append(icon("pin-off"));
    unpin.addEventListener("click", unpinChip);
    heading.append(unpin);
    container.append(heading, node("p", CHIP_MODELS[chip.model].title + " \xB7 \u7F3A\u53E3\u671D\u5DE6", "inspection-meta"));
    appendChipReference(container, chip);
    const controls = node("div", "", "move-fields");
    const sectionLabel = node("label", "\u677F\u5757", "");
    const section = document.createElement("select");
    section.id = "move-section";
    for (let index = 0; index < 4; index = index + 1) {
      const option = node("option", "\u7B2C " + (index + 1) + " \u5757", "");
      option.value = String(index);
      section.append(option);
    }
    section.value = String(chip.section);
    sectionLabel.append(section);
    const columnLabel = node("label", "\u8D77\u59CB\u5217", "");
    const column = document.createElement("input");
    column.id = "move-column";
    column.type = "number";
    column.min = "1";
    column.max = "59";
    column.value = String(chip.column);
    columnLabel.append(column);
    const move = node("button", "\u79FB\u52A8\u82AF\u7247", "button");
    move.addEventListener("click", moveChip);
    controls.append(sectionLabel, columnLabel, move);
    move.disabled = readOnly;
    remove.disabled = readOnly;
    section.disabled = readOnly;
    column.disabled = readOnly;
    container.append(controls);
    appendChipPinTable(container, chip);
  }
  function appendChipPinTable(container, chip) {
    const table = node("table", "", "pin-table");
    const head = document.createElement("tr");
    head.append(node("th", "\u811A", ""), node("th", "\u540D\u79F0", ""), node("th", "\u7535\u5E73", ""), node("th", "\u4F4D\u7F6E", ""));
    table.append(head);
    for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
      appendPinRow(table, chip, pin);
    }
    container.append(table);
  }
  function moveChip() {
    if (editingLocked()) {
      return;
    }
    const chip = findChip(state.pinnedChip);
    const candidate = { id: chip.id, model: chip.model, section: Number(element("move-section").value), column: Number(element("move-column").value) };
    let error = placementError(state.project.chips, candidate, chip.id);
    for (const wire of state.project.wires) {
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        const hole = pinHole(candidate, pin);
        if (wire.from === hole || wire.to === hole) {
          error = "\u65B0\u4F4D\u7F6E\u7684\u82AF\u7247\u5B54\u88AB\u5BFC\u7EBF\u5360\u7528\uFF0C\u8BF7\u5148\u79FB\u8D70\u5BFC\u7EBF";
        }
      }
    }
    if (error !== "") {
      toast(error, "error");
      return;
    }
    remember();
    chip.section = candidate.section;
    chip.column = candidate.column;
    lastPinnedChip = "";
    delete state.runtime.registers[chip.id];
    delete state.runtime.devices[chip.id];
    commit();
  }
  function renderInspection() {
    const container = element("inspect-panel");
    const scrollTop = container.scrollTop;
    container.replaceChildren();
    if (catalogModel !== "") {
      renderCatalogInfo(container, catalogModel);
      return;
    }
    if (state.selection.length > 1) {
      renderMultiInspection(container);
      container.scrollTop = scrollTop;
      return;
    }
    if (state.selected && state.selected.kind === "chip") {
      const chip = findChip(state.selected.id);
      if (chip) {
        container.append(node("h2", chip.id + " \xB7 " + chip.model, ""), node("p", "\u5F15\u811A\u4FE1\u606F\u5DF2\u56FA\u5B9A\u5728\u4E0A\u65B9", "inspection-meta"));
        return;
      }
    }
    if (state.selected && state.selected.kind === "wire") {
      const wire = findWire(state.selected.id);
      if (wire) {
        container.append(node("h2", wire.id, ""), node("p", endpointLabel(wire.from) + " \u2192 " + endpointLabel(wire.to), "inspection-meta"));
        container.append(node("div", String(readEndpoint(state.result, wire.from)), "node-value"));
        const remove = node("button", "\u5220\u9664\u5BFC\u7EBF", "button");
        remove.addEventListener("click", deleteSelected);
        container.append(remove);
        return;
      }
    }
    if (state.selected && state.selected.kind === "node") {
      const name = state.selected.id;
      container.append(node("h2", endpointLabel(name), ""), node("p", name, "inspection-meta"), node("div", String(readEndpoint(state.result, name)), "node-value"));
      const pullUp = node("button", "\u4E3A\u6B64\u8282\u70B9\u6DFB\u52A0\u4E0A\u62C9", "button");
      if (state.project.pullUps.includes(name)) {
        pullUp.textContent = "\u79FB\u9664\u6B64\u8282\u70B9\u4E0A\u62C9";
      }
      pullUp.disabled = readOnly;
      pullUp.dataset.endpoint = name;
      pullUp.addEventListener("click", togglePullUp);
      container.append(pullUp);
      for (const chip of state.project.chips) {
        for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
          if (pinHole(chip, pin) === name) {
            container.append(node("p", chip.id + " \u7B2C " + pin + " \u811A \xB7 " + CHIP_MODELS[chip.model].labels[pin], "inspection-meta"));
          }
        }
      }
      return;
    }
    const empty = node("div", "", "empty-inspector");
    empty.append(icon("scan-line"), node("strong", "\u672A\u9009\u62E9\u5BF9\u8C61", ""), node("p", "\u82AF\u7247 " + state.project.chips.length + " \u7247 \xB7 \u5BFC\u7EBF " + state.project.wires.length + " \u6839", ""));
    container.append(empty);
    const summary = node("table", "", "pin-table");
    for (const chip of state.project.chips) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      const button = node("button", chip.id + "  " + chip.model, "");
      button.dataset.chip = chip.id;
      button.addEventListener("click", selectChipFromList);
      cell.append(button);
      row.append(cell, node("td", "\u7B2C" + (chip.section + 1) + "\u5757", ""));
      summary.append(row);
    }
    container.append(summary);
  }
  function togglePullUp(event) {
    if (editingLocked()) {
      return;
    }
    remember();
    const endpoint = event.currentTarget.dataset.endpoint;
    const index = state.project.pullUps.indexOf(endpoint);
    if (index >= 0) {
      state.project.pullUps.splice(index, 1);
    } else {
      state.project.pullUps.push(endpoint);
    }
    commit();
  }
  function renderCatalogInfo(container, modelName) {
    const model = CHIP_MODELS[modelName];
    const heading = node("div", "", "inspection-heading");
    heading.append(node("h2", modelName, ""));
    container.append(heading, node("p", model.title + " \xB7 DIP-" + model.count, "inspection-meta"));
    appendChipReference(container, { model: modelName });
    const place = node("button", "", "button catalog-place");
    place.id = "place-catalog-chip";
    place.append(icon("microchip"), node("span", "\u653E\u7F6E\u82AF\u7247", ""));
    place.disabled = readOnly;
    place.addEventListener("click", placeCatalogChip);
    container.append(place);
    const table = node("table", "", "pin-table catalog-pin-table");
    const header = document.createElement("tr");
    header.append(node("th", "\u811A\u53F7", ""), node("th", "\u540D\u79F0", ""), node("th", "\u7C7B\u578B", ""));
    table.append(header);
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      let kind = "\u8F93\u5165";
      if (pin === model.power) {
        kind = "+5V \u7535\u6E90";
      } else if (pin === model.ground) {
        kind = "\u5730";
      } else if (model.outputs.includes(pin)) {
        kind = "\u8F93\u51FA";
      }
      const row = document.createElement("tr");
      row.append(node("td", String(pin), ""), node("td", model.labels[pin], ""), node("td", kind, ""));
      table.append(row);
    }
    container.append(table);
  }
  function deselectFromInspection(event) {
    const kind = event.currentTarget.dataset.kind;
    const id = event.currentTarget.dataset.id;
    const kept = [];
    for (const target of state.selection) {
      if (target.kind !== kind || target.id !== id) {
        kept.push(target);
      }
    }
    state.selection = kept;
    state.selected = null;
    if (kept.length > 0) {
      state.selected = kept[kept.length - 1];
    }
    if (kind === "chip" && state.pinnedChip === id) {
      state.pinnedChip = "";
    }
    render();
  }
  function toggleSelectionDetails(event) {
    const details = event.currentTarget;
    if (details.open) {
      expandedSelection.add(details.dataset.chip);
    } else {
      expandedSelection.delete(details.dataset.chip);
    }
  }
  function selectionHeading(container, target, title) {
    const heading = node("div", "", "selection-heading");
    heading.append(node("h3", title, ""));
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "\u53D6\u6D88\u9009\u62E9 " + target.id);
    remove.dataset.kind = target.kind;
    remove.dataset.id = target.id;
    remove.append(icon("x"));
    remove.addEventListener("click", deselectFromInspection);
    heading.append(remove);
    container.append(heading);
  }
  function appendSelectedWire(container, target, wire) {
    selectionHeading(container, target, wire.id + " \xB7 \u5BFC\u7EBF");
    const swatch = node("span", "", "selection-wire-color");
    swatch.style.backgroundColor = wire.color;
    swatch.setAttribute("aria-label", "\u989C\u8272 " + wire.color);
    const color = node("div", "", "selection-wire-meta");
    color.append(swatch, node("span", wire.color, ""));
    container.append(color);
    const list = node("dl", "", "selection-wire-endpoints");
    for (const endpoint of [wire.from, wire.to]) {
      const row = node("div", "", "selection-endpoint");
      const value = readEndpoint(state.result, endpoint);
      row.append(node("dt", endpointLabel(endpoint), ""), node("dd", String(value), "logic-level"));
      list.append(row);
    }
    container.append(list);
  }
  function appendSelectedChip(container, target, chip) {
    const model = CHIP_MODELS[chip.model];
    selectionHeading(container, target, chip.id + " \xB7 " + chip.model);
    const lastColumn = chip.column + model.count / 2 - 1;
    container.append(node("p", model.title + " \xB7 \u7B2C " + (chip.section + 1) + " \u5757 \xB7 " + chip.column + "\uFF5E" + lastColumn + " \u5217", "selection-location"));
    container.append(node("p", CHIP_REFERENCES[chip.model].summary, "chip-summary"));
    const details = node("details", "", "selection-chip-details");
    details.dataset.chip = chip.id;
    details.open = expandedSelection.has(chip.id);
    details.append(node("summary", "\u5F15\u811A\u56FE\u4E0E\u5B9E\u65F6\u7535\u5E73", ""));
    const body = node("div", "", "selection-chip-body");
    appendChipReference(body, chip);
    appendChipPinTable(body, chip);
    details.append(body);
    details.addEventListener("toggle", toggleSelectionDetails);
    container.append(details);
  }
  function renderMultiInspection(container) {
    container.append(node("p", "\u5DF2\u9009\u62E9 " + state.selection.length + " \u4E2A\u5BF9\u8C61", "inspection-meta"));
    const list = node("div", "", "selection-list");
    for (const target of state.selection) {
      const section = node("section", "", "selection-item");
      section.dataset.kind = target.kind;
      section.dataset.id = target.id;
      section.setAttribute("aria-label", target.id + " \u68C0\u67E5\u4FE1\u606F");
      if (target.kind === "wire") {
        const wire = findWire(target.id);
        if (wire) {
          appendSelectedWire(section, target, wire);
          list.append(section);
        }
      } else if (target.kind === "chip") {
        const chip = findChip(target.id);
        if (chip) {
          appendSelectedChip(section, target, chip);
          list.append(section);
        }
      }
    }
    container.append(list);
    const remove = node("button", "", "button selection-delete");
    remove.append(icon("trash-2"), node("span", "\u5220\u9664\u6240\u9009\u5BF9\u8C61", ""));
    remove.disabled = readOnly;
    remove.addEventListener("click", deleteSelected);
    container.append(remove);
  }
  function selectChipFromList(event) {
    selectTarget({ kind: "chip", id: event.currentTarget.dataset.chip }, event.ctrlKey || event.metaKey);
    render();
  }
  function selectWireFromList(event) {
    selectTarget({ kind: "wire", id: event.currentTarget.dataset.wire }, event.ctrlKey || event.metaKey);
    state.activeTab = "inspect";
    render();
  }
  function deleteWireFromList(event) {
    const target = { kind: "wire", id: event.currentTarget.dataset.wire };
    if (!editingLocked()) {
      confirmAction("\u5220\u9664\u5BFC\u7EBF\uFF1F", "\u786E\u8BA4\u5220\u9664 " + target.id + "\uFF1F", removeTargets.bind(null, [target]));
    }
  }
  function renderWireList() {
    const container = element("wires-panel");
    container.replaceChildren();
    for (const wire of state.project.wires) {
      const row = node("div", "", "wire-row");
      const swatch = node("span", "", "");
      swatch.style.backgroundColor = wire.color;
      const select = node("button", "", "");
      select.dataset.wire = wire.id;
      select.append(node("small", wire.id + " \xB7 " + readEndpoint(state.result, wire.from), ""), node("span", endpointLabel(wire.from) + " \u2192 " + endpointLabel(wire.to), ""));
      select.addEventListener("click", selectWireFromList);
      const remove = node("button", "", "icon-button");
      remove.dataset.wire = wire.id;
      remove.setAttribute("aria-label", "\u5220\u9664 " + wire.id);
      remove.append(icon("x"));
      remove.addEventListener("click", deleteWireFromList);
      remove.disabled = readOnly;
      row.append(swatch, select, remove);
      container.append(row);
    }
    if (state.project.wires.length === 0) {
      container.append(node("p", "\u6682\u65E0\u5BFC\u7EBF", "empty-inspector"));
    }
  }
  function renderDiagnostics() {
    const container = element("diagnostics-panel");
    container.replaceChildren();
    if (state.result.issues.length === 0 && wiringAudit.length === 0) {
      const item = node("div", "", "diagnostic success");
      let message = "\u672A\u53D1\u73B0\u4F9B\u7535\u3001\u60AC\u7A7A\u8F93\u5165\u6216\u8F93\u51FA\u51B2\u7A81";
      if (!state.project.power) {
        message = "\u7535\u6E90\u5DF2\u5173\u95ED";
      } else if (state.project.chips.length === 0) {
        message = "\u5F53\u524D\u6CA1\u6709\u82AF\u7247";
      }
      item.append(icon("circle-check"), node("span", message, ""));
      container.append(item);
    }
    for (const issue of state.result.issues) {
      const item = node("div", "", "diagnostic " + issue.severity);
      item.append(icon("triangle-alert"), node("span", issue.message, ""));
      container.append(item);
    }
    for (const message of wiringAudit.slice(0, 80)) {
      const item = node("div", "", "diagnostic warning");
      item.append(icon("route"), node("span", message, ""));
      container.append(item);
    }
  }
  function renderPanels() {
    renderPinnedChip();
    for (const name of ["inspect", "wires", "diagnostics", "notes"]) {
      const active = name === state.activeTab;
      element(name + "-panel").hidden = !active;
      element("tab-" + name).classList.toggle("active", active);
      element("tab-" + name).setAttribute("aria-selected", String(active));
    }
    renderInspection();
    if (state.activeTab === "wires") {
      renderWireList();
    }
    if (state.activeTab === "diagnostics") {
      renderDiagnostics();
    }
    if (state.activeTab === "notes") {
      renderNotes();
    }
    refreshIcons();
  }
  function renderPinnedChip() {
    if (state.selected && state.selected.kind === "chip") {
      state.pinnedChip = state.selected.id;
    }
    const container = element("pinned-chip");
    if (state.selection.length > 1) {
      container.hidden = true;
      return;
    }
    const chip = findChip(state.pinnedChip);
    container.hidden = !chip;
    if (!chip) {
      container.replaceChildren();
      lastPinnedChip = "";
      return;
    }
    if (lastPinnedChip !== chip.id) {
      container.replaceChildren();
      renderChipPanel(container, chip);
      lastPinnedChip = chip.id;
      fadeContent(container);
    } else {
      for (const cell of container.querySelectorAll("[data-pin]")) {
        const value = readEndpoint(state.result, pinHole(chip, Number(cell.dataset.pin)));
        cell.textContent = String(value);
        cell.classList.toggle("high", value === 1);
        cell.classList.toggle("unknown", value === "X" || value === "Z");
      }
    }
  }
  function unpinChip() {
    state.pinnedChip = "";
    if (state.selected && state.selected.kind === "chip") {
      state.selected = null;
      state.selection = [];
    }
    render();
  }
  function createQuickInput(bit) {
    const wrapper = node("div", "", "quick-input");
    wrapper.append(node("span", "K" + bit, "quick-port-label"));
    const led = node("span", "", "io-led");
    led.dataset.inputLed = String(bit);
    led.setAttribute("role", "img");
    const button = node("button", "0", "bit-button");
    button.dataset.bit = String(bit);
    button.setAttribute("aria-label", "\u5207\u6362 K" + bit);
    button.addEventListener("click", clickQuickSwitch);
    wrapper.append(led, button);
    return wrapper;
  }
  function ensureInputControls(count) {
    if (lastInputCount === count) {
      return;
    }
    const container = element("quick-switches");
    container.replaceChildren();
    for (let bit = count - 1; bit >= 0; bit = bit - 1) {
      container.append(createQuickInput(bit));
    }
    lastInputCount = count;
    fadeContent(container);
  }
  function setLedState(led, name, value) {
    led.classList.toggle("on", value === 1);
    led.dataset.value = String(value);
    led.setAttribute("aria-label", name + "\uFF1A" + value);
    led.title = name + "\uFF1A" + value;
  }
  function renderOutputLeds(count) {
    const container = element("output-leds");
    if (container.children.length !== count) {
      container.replaceChildren();
      for (let bit = count - 1; bit >= 0; bit = bit - 1) {
        const wrapper = node("div", "", "output-port");
        const led = node("span", "", "io-led");
        led.dataset.outputLed = String(bit);
        led.setAttribute("role", "img");
        wrapper.append(led, node("span", "L" + bit, "quick-port-label"));
        container.append(wrapper);
      }
    }
    for (const led of container.querySelectorAll("[data-output-led]")) {
      const name = "L" + led.dataset.outputLed;
      setLedState(led, name, readEndpoint(state.result, name));
    }
  }
  function renderIo() {
    const inputCount = state.project.inputCount;
    const outputCount = state.project.outputCount;
    ensureInputControls(inputCount);
    let input = 0;
    for (const button of element("quick-switches").querySelectorAll("button")) {
      const bit = Number(button.dataset.bit);
      const value = state.project.switches[bit];
      button.textContent = String(value);
      button.setAttribute("aria-pressed", String(value === 1));
      const led = button.parentElement.querySelector(".io-led");
      setLedState(led, "K" + bit, readEndpoint(state.result, "K" + bit));
      input = input * 2 + value;
    }
    element("input-decimal").textContent = String(input);
    element("input-count").value = String(state.project.inputCount);
    element("output-count").value = String(state.project.outputCount);
    element("input-label").textContent = "\u8F93\u5165 K" + (inputCount - 1) + "\u2026K0";
    element("output-label").textContent = "\u8F93\u51FA L" + (outputCount - 1) + "\u2026L0";
    let binary = "";
    let known = true;
    let number = 0;
    for (let bit = outputCount - 1; bit >= 0; bit = bit - 1) {
      const value = readEndpoint(state.result, "L" + bit);
      binary = binary + String(value);
      if (bit > 0 && bit % 4 === 0) {
        binary = binary + " ";
      }
      if (value !== 0 && value !== 1) {
        known = false;
      } else {
        number = number * 2 + value;
      }
    }
    element("binary-result").textContent = binary;
    element("binary-result").classList.add("general-binary");
    renderOutputLeds(outputCount);
    let meaning = "\u672A\u77E5 / \u60AC\u7A7A";
    if (!state.project.power) {
      meaning = "\u7535\u6E90\u5173\u95ED";
    } else if (known) {
      meaning = String(number);
    }
    element("result-meaning").textContent = meaning;
  }
  function changeIoCount(event) {
    if (editingLocked()) {
      renderIo();
      return;
    }
    const count = Number(event.currentTarget.value);
    if (!Number.isInteger(count) || count < 1 || count > IO_LIMIT) {
      toast("\u663E\u793A\u4F4D\u6570\u5FC5\u987B\u4E3A 1\uFF5E24\uFF0C\u8BF7\u8F93\u5165\u6574\u6570", "warning");
      renderIo();
      return;
    }
    remember();
    if (event.currentTarget.id === "input-count") {
      state.project.inputCount = count;
    } else {
      state.project.outputCount = count;
    }
    commit();
    fadeContent(document.querySelector(".io-strip"));
  }
  function renderNotes() {
    const editor = element("notes-editor");
    if (editor.value !== state.project.notes) {
      editor.value = state.project.notes;
    }
    editor.hidden = !state.notesEditing;
    element("notes-editor-label").hidden = !state.notesEditing;
    element("notes-preview").hidden = state.notesEditing;
    element("notes-edit-button").classList.toggle("selected", state.notesEditing);
    element("notes-edit-button").setAttribute("aria-pressed", String(state.notesEditing));
    element("notes-preview-button").classList.toggle("selected", !state.notesEditing);
    element("notes-preview-button").setAttribute("aria-pressed", String(!state.notesEditing));
    if (!state.notesEditing) {
      element("notes-preview").replaceChildren(markdownFragment(state.project.notes));
    }
    element("notes-status").textContent = state.project.notes.length + " / " + NOTES_LIMIT + " \xB7 \u968F\u7535\u8DEF\u4FDD\u5B58";
  }
  function editNotes() {
    if (editingLocked()) {
      return;
    }
    state.notesEditing = true;
    renderNotes();
    element("notes-editor").focus({ preventScroll: true });
    fadeContent(element("notes-editor"));
  }
  function previewNotes() {
    state.notesEditing = false;
    renderNotes();
    fadeContent(element("notes-preview"));
  }
  function rememberNotes() {
    remember();
  }
  function updateNotes(event) {
    if (editingLocked()) {
      renderNotes();
      return;
    }
    state.project.notes = event.currentTarget.value;
    stageChanges();
    element("notes-status").textContent = state.project.notes.length + " / " + NOTES_LIMIT + " \xB7 \u6309 Ctrl+S \u4FDD\u5B58";
    element("undo").disabled = state.undo.length === 0;
    element("redo").disabled = state.redo.length === 0;
  }
  function render() {
    updateActionStatus();
    for (const button of document.querySelectorAll(".pulse-button")) {
      const pressed = button.dataset.pulse === state.pressedPulse;
      button.classList.toggle("pressed", pressed);
      button.setAttribute("aria-pressed", String(pressed));
    }
    element("save-status").textContent = "\u5F53\u524D\u5B9E\u9A8C\u5DF2\u4FDD\u5B58";
    if (dirtyExperiments.has(activeExperiment)) {
      element("save-status").textContent = "\u5F53\u524D\u5B9E\u9A8C\u672A\u4FDD\u5B58";
    }
    element("read-only-toggle").checked = readOnly;
    element("project-name").readOnly = readOnly;
    for (const id of ["tool-place", "tool-wire", "tool-delete", "arrange-wires", "connect-endpoints", "input-count", "output-count", "notes-edit-button"]) {
      element(id).disabled = readOnly;
    }
    element("arrange-wires").disabled = readOnly || routingBusy;
    element("arrange-wires").setAttribute("aria-busy", String(routingBusy));
    element("project-name").value = state.project.name;
    element("power-toggle").checked = state.project.power;
    element("undo").disabled = readOnly || state.undo.length === 0;
    element("redo").disabled = readOnly || state.redo.length === 0;
    element("cancel-wire").disabled = !state.pending && state.placing === "";
    for (const name of ["place", "wire", "select", "delete"]) {
      const active = state.tool === name;
      element("tool-" + name).classList.toggle("selected", active);
      element("tool-" + name).setAttribute("aria-pressed", String(active));
    }
    for (const button of element("wire-palette").children) {
      const active = button.dataset.color === state.wireColor;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    element("custom-color").value = state.wireColor;
    element("wire-count").textContent = String(state.project.wires.length);
    element("issue-count").textContent = String(state.result.issues.length + wiringAudit.length);
    element("circuit-count").textContent = state.project.chips.length + " \u7247\u82AF\u7247 \xB7 " + state.project.wires.length + " \u6839\u5BFC\u7EBF";
    let status = "\u7535\u8DEF\u7A33\u5B9A";
    if (!state.project.power) {
      status = "\u7535\u6E90\u5173\u95ED";
    } else if (state.result.issues.length > 0) {
      status = state.result.issues.length + " \u9879\u8BCA\u65AD";
    }
    if (state.pending) {
      status = "\u63A5\u7EBF\u8D77\u70B9\uFF1A" + endpointLabel(state.pending.from);
    } else if (state.placing) {
      status = "\u5F85\u653E\u7F6E " + state.placing;
    }
    element("simulation-status").textContent = status;
    renderIo();
    renderExperiments();
    renderPanels();
    renderBoard(canvas, state, endpoints);
  }
  function updateActionStatus() {
    let message = "\u5C31\u7EEA";
    if (recentAction !== "") {
      message = recentAction;
    }
    if (state.pressedPulse !== "") {
      message = state.pressedPulse + " \u8109\u51B2";
    } else if (state.placing !== "") {
      message = "\u5F85\u653E\u7F6E " + state.placing;
    } else if (state.pending) {
      message = "\u63A5\u7EBF\u8D77\u70B9\uFF1A" + endpointLabel(state.pending.from);
    } else if (catalogModel !== "") {
      message = "\u6B63\u5728\u67E5\u770B " + catalogModel;
    } else if (state.selection.length > 1) {
      message = "\u5DF2\u9009\u62E9 " + state.selection.length + " \u4E2A\u5BF9\u8C61";
    } else if (state.selected) {
      message = "\u5DF2\u9009\u62E9 " + state.selected.id;
    }
    element("action-status").textContent = message;
  }
  function showHelp() {
    element("help-dialog").showModal();
    fadeContent(element("help-dialog"));
  }
  function closeHelp() {
    element("help-dialog").close();
  }
  function keyDown(event) {
    const tag = event.target.tagName;
    const editing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveCurrent();
      return;
    }
    if (element("confirm-dialog").open) {
      return;
    }
    if (event.key === "Escape") {
      cancelWire();
      return;
    }
    if (editing || element("help-dialog").open) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redoEdit();
      } else {
        undoEdit();
      }
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
    }
  }
  function bindEvents() {
    element("tool-place").addEventListener("click", chooseTool);
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", cancelPointer);
    element("save-project").addEventListener("click", saveCurrent);
    element("autosave-toggle").addEventListener("change", changeAutoSave);
    element("quick-delete").addEventListener("click", quickDelete);
    element("confirm-cancel").addEventListener("click", cancelConfirmation);
    element("confirm-accept").addEventListener("click", acceptConfirmation);
    element("export-workspace").addEventListener("click", exportWorkspace);
    window.addEventListener("beforeunload", beforeLeave);
    element("read-only-toggle").addEventListener("change", changeReadOnly);
    element("new-experiment").addEventListener("click", newProject);
    element("experiment-picker").addEventListener("change", switchExperiment);
    element("audit-preset").addEventListener("click", auditCurrentWiring);
    element("arrange-wires").addEventListener("click", requestWireRouting);
    canvas.addEventListener("click", clickBoard);
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerleave", leaveBoard);
    element("board-viewport").addEventListener("wheel", wheelBoard, { passive: false });
    element("tool-wire").addEventListener("click", chooseTool);
    element("tool-select").addEventListener("click", chooseTool);
    element("tool-delete").addEventListener("click", chooseTool);
    element("chip-search").addEventListener("input", renderLibrary);
    element("custom-color").addEventListener("input", chooseCustomColor);
    element("cancel-wire").addEventListener("click", cancelWire);
    element("undo").addEventListener("click", undoEdit);
    element("redo").addEventListener("click", redoEdit);
    element("zoom-in").addEventListener("click", zoomIn);
    element("zoom-out").addEventListener("click", zoomOut);
    element("fit-board").addEventListener("click", fitBoard);
    element("show-internals").addEventListener("change", changeDisplayOptions);
    element("show-levels").addEventListener("change", changeDisplayOptions);
    for (const button of document.querySelectorAll(".pulse-button")) {
      button.addEventListener("pointerdown", pressPulseButton);
      button.addEventListener("pointerup", releasePulseButton);
      button.addEventListener("pointercancel", releasePulseButton);
      button.addEventListener("click", clickPulseButton);
    }
    window.addEventListener("blur", releasePulseButton);
    element("power-toggle").addEventListener("change", changePower);
    element("new-project").addEventListener("click", newProject);
    element("load-preset").addEventListener("click", loadPreset);
    element("export-project").addEventListener("click", exportProject);
    element("import-project").addEventListener("click", chooseImport);
    element("import-file").addEventListener("change", importProject);
    element("project-name").addEventListener("change", renameProject);
    element("export-image").addEventListener("click", exportImage);
    element("connect-endpoints").addEventListener("click", connectByName);
    element("tab-inspect").addEventListener("click", changeTab);
    element("tab-wires").addEventListener("click", changeTab);
    element("tab-diagnostics").addEventListener("click", changeTab);
    element("tab-notes").addEventListener("click", changeTab);
    element("input-count").addEventListener("change", changeIoCount);
    element("output-count").addEventListener("change", changeIoCount);
    element("notes-edit-button").addEventListener("click", editNotes);
    element("notes-preview-button").addEventListener("click", previewNotes);
    element("notes-editor").addEventListener("focus", rememberNotes);
    element("notes-editor").addEventListener("input", updateNotes);
    element("help-button").addEventListener("click", showHelp);
    element("close-help").addEventListener("click", closeHelp);
    document.addEventListener("keydown", keyDown);
  }
  function start() {
    canvas = element("board-canvas");
    canvas.height = BOARD.height * 2;
    canvas.style.height = BOARD.height + "px";
    let loadError = "";
    let removedCount = 0;
    try {
      readOnly = localStorage.getItem(READ_ONLY_KEY) === "true";
      const savedWorkspace = localStorage.getItem(WORKSPACE_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (savedWorkspace) {
        workspace = validateWorkspace(JSON.parse(savedWorkspace));
        const beforeCleanup = JSON.stringify(workspace);
        removedCount = cleanWorkspace(workspace).length;
        if (removedCount > 0) {
          localStorage.setItem(CLEANUP_BACKUP_KEY, beforeCleanup);
          localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
        }
        activeExperiment = workspace.activeId;
        state.project = copyProject(workspace.projects[activeExperiment]);
      } else if (saved) {
        state.project = validateProject(JSON.parse(saved));
      } else {
        state.project = complementPreset();
      }
    } catch (error) {
      state.project = complementPreset();
      loadError = "\u672C\u5730\u7535\u8DEF\u65E0\u6CD5\u6062\u590D\uFF0C\u5DF2\u6253\u5F00\u793A\u4F8B\u3002\u539F\u6587\u4EF6\u53EF\u91CD\u65B0\u5BFC\u5165";
    }
    if (activeExperiment === "") {
      activeExperiment = newExperimentId();
      keepExperiment(workspace, activeExperiment, state.project);
    }
    savedExperiments = copyProject(workspace);
    bindEvents();
    createPalette();
    calculate(false);
    renderLibrary();
    fitBoard();
    render();
    refreshIcons();
    updateClock();
    window.setInterval(updateClock, 1e3);
    if (loadError !== "") {
      toast(loadError, "warning");
    }
    if (removedCount > 0) {
      toast("\u5DF2\u6574\u7406 " + removedCount + " \u4EFD\u91CD\u590D\u7A7A\u767D\u6216\u8865\u7801\u5B9E\u9A8C\uFF0C\u6574\u7406\u524D\u7684\u5217\u8868\u5DF2\u5907\u4EFD", "info");
    }
    if (state.project.name === "\u53CC\u7B26\u53F7\u4F4D\u8865\u7801\u8FD0\u7B97\u5668") {
      wiringAudit = auditComplement(state.project);
      if (wiringAudit.length > 0) {
        state.activeTab = "diagnostics";
        render();
        toast("\u8FD9\u4EFD\u5B9E\u9A8C\u7684\u63A5\u7EBF\u4E0E\u6807\u51C6\u793A\u4F8B\u6709\u5DEE\u5F02\u3002\u4F60\u53EF\u4EE5\u67E5\u770B\u8BCA\u65AD\u9762\u677F\uFF0C\u6216\u6253\u5F00\u4E00\u4EFD\u65B0\u7684\u8865\u7801\u793A\u4F8B\u5BF9\u7167", "warning");
      }
    }
  }
  start();
})();
/*! Bundled license information:

dompurify/dist/purify.es.mjs:
  (*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE *)
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)
*/
