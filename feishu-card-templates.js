/**
 * 飞书卡片消息模板库
 * 提供多种类型的交互式卡片模板
 */

class FeishuCardTemplates {
  /**
   * 简单的欢迎卡片
   */
  static welcomeCard() {
    return {
      msg_type: 'interactive',
      content: JSON.stringify({
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: '**欢迎使用 AI 助手！** 👋',
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            text: {
              content: '我是您的智能助手，可以帮您管理知识库、搜索信息、创建任务等。',
              tag: 'lark_md'
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '📚 查看知识库',
                  tag: 'lark_md'
                },
                type: 'primary',
                value: {
                  action: 'view_knowledge'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '🔍 搜索内容',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'search'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '➕ 创建笔记',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'create_note'
                }
              }
            ]
          }
        ],
        header: {
          template: 'blue',
          title: {
            content: '🤖 AI 助手就绪',
            tag: 'lark_md'
          }
        }
      })
    };
  }

  /**
   * 知识库管理卡片
   */
  static knowledgeCard() {
    const fileCount = 12;
    const totalSize = '3.2 MB';
    
    return {
      msg_type: 'interactive',
      content: JSON.stringify({
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: '## 🏠 知识库管理',
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            text: {
              content: '您的知识库已准备就绪，可以通过下方操作进行管理。',
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            fields: [
              {
                is_short: true,
                text: {
                  content: '**文件数量**',
                  tag: 'lark_md'
                }
              },
              {
                is_short: true,
                text: {
                  content: `${fileCount} 个文件`,
                  tag: 'lark_md'
                }
              },
              {
                is_short: true,
                text: {
                  content: '**总大小**',
                  tag: 'lark_md'
                }
              },
              {
                is_short: true,
                text: {
                  content: totalSize,
                  tag: 'lark_md'
                }
              }
            ]
          },
          {
            tag: 'hr'
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '📖 查看知识库',
                  tag: 'lark_md'
                },
                type: 'primary',
                value: {
                  action: 'view_knowledge'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '🔍 搜索内容',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'search'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '➕ 添加笔记',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'add_note'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '📊 统计信息',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'statistics'
                }
              }
            ]
          }
        ],
        header: {
          template: 'blue',
          title: {
            content: '🎓 知识库管理',
            tag: 'lark_md'
          }
        }
      })
    };
  }

  /**
   * 问题求解卡片
   */
  static questionCard(question) {
    return {
      msg_type: 'interactive',
      content: JSON.stringify({
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: `**❓ 问题**`,
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            text: {
              content: question,
              tag: 'lark_md'
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '💡 搜索答案',
                  tag: 'lark_md'
                },
                type: 'primary',
                value: {
                  action: 'search',
                  question: question
                }
              },
              {
                tag: 'button',
                text: {
                  content: '🔍 知识库搜索',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'knowledge_search',
                  question: question
                }
              },
              {
                tag: 'button',
                text: {
                  content: '📝 添加笔记',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'add_note',
                  question: question
                }
              }
            ]
          }
        ],
        header: {
          template: 'orange',
          title: {
            content: '🎯 问题求解',
            tag: 'lark_md'
          }
        }
      })
    };
  }

  /**
   * 任务管理卡片
   */
  static taskCard() {
    const tasks = [
      { name: '学习飞书卡片消息格式', status: '完成' },
      { name: '创建卡片模板库', status: '进行中' },
      { name: '测试交互式功能', status: '待开始' }
    ];
    
    return {
      msg_type: 'interactive',
      content: JSON.stringify({
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: '## 📋 任务管理',
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            text: {
              content: '您有以下任务需要处理：',
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            fields: tasks.map(task => ({
              is_short: true,
              text: {
                content: `**${task.name}**`,
                tag: 'lark_md'
              }
            })).concat(tasks.map(task => ({
              is_short: true,
              text: {
                content: task.status === '完成' ? '✅ 完成' : task.status === '进行中' ? '⏳ 进行中' : '⏰ 待开始',
                tag: 'lark_md'
              }
            })))
          },
          {
            tag: 'hr'
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '➕ 添加任务',
                  tag: 'lark_md'
                },
                type: 'primary',
                value: {
                  action: 'add_task'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '📊 任务统计',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'task_statistics'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '🔄 更新状态',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'update_status'
                }
              }
            ]
          }
        ],
        header: {
          template: 'green',
          title: {
            content: '✅ 任务管理',
            tag: 'lark_md'
          }
        }
      })
    };
  }

  /**
   * 学习卡片
   */
  static learningCard(topic) {
    return {
      msg_type: 'interactive',
      content: JSON.stringify({
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: `**📖 学习主题：** ${topic}`,
              tag: 'lark_md'
            }
          },
          {
            tag: 'div',
            text: {
              content: '这是一个重要的学习主题，需要系统地学习和掌握。',
              tag: 'lark_md'
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '📚 查看资料',
                  tag: 'lark_md'
                },
                type: 'primary',
                value: {
                  action: 'view_materials',
                  topic: topic
                }
              },
              {
                tag: 'button',
                text: {
                  content: '🔍 搜索相关内容',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'search_related',
                  topic: topic
                }
              },
              {
                tag: 'button',
                text: {
                  content: '📝 做笔记',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'take_notes',
                  topic: topic
                }
              }
            ]
          }
        ],
        header: {
          template: 'purple',
          title: {
            content: '🎓 学习中心',
            tag: 'lark_md'
          }
        }
      })
    };
  }

  /**
   * 通知卡片
   */
  static notificationCard(title, content) {
    return {
      msg_type: 'interactive',
      content: JSON.stringify({
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: content,
              tag: 'lark_md'
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '👍 已读',
                  tag: 'lark_md'
                },
                type: 'primary',
                value: {
                  action: 'mark_read'
                }
              },
              {
                tag: 'button',
                text: {
                  content: '📎 查看详情',
                  tag: 'lark_md'
                },
                type: 'default',
                value: {
                  action: 'view_details'
                }
              }
            ]
          }
        ],
        header: {
          template: 'blue',
          title: {
            content: title,
            tag: 'lark_md'
          }
        }
      })
    };
  }
}

module.exports = FeishuCardTemplates;
