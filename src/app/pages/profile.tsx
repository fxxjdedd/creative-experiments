export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-zinc-900 min-h-screen">
      {/* 标题和个人信息 */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">傅腾达的简历</h1>
        <div className="text-zinc-600 space-y-1">
          <p>
            <span className="mr-4">📱 (+86) 18515236406</span>
            <span className="mr-4">📧 fxxjdedd@gmail.com</span>
            <span className="mr-4">👤 30岁</span>
          </p>
          <p>📍 当前在北京，目标城市青岛</p>
        </div>
      </header>

      {/* 个人简介 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#2670ac" }}>
          个人介绍
        </h2>
        {/* prettier-ignore */}
        <p className="text-zinc-700 leading-relaxed">
          有 5 年前端开发经验， 3年图形渲染经验，熟悉各种前端技术、渲染技术，略懂一些服务端数据库知识，有很强的问题分析和解决能力，对本领域、跨领域新技术十分敏感并有强烈的好奇心和自驱力。能独自负责完整的前端项目，能深度参与游戏、GIS、BIM相关领域工作，十分乐于接受有挑战的工作，并享受过程中带来的个人能力的成长。
        </p>
        <p className="text-zinc-700 mt-2 leading-relaxed">
          理想的工作内容最好跟图形渲染技术相关，这样我的能力能得到最大程度的发挥。但有挑战的纯前端、全栈、Web3等工作机会也都在考虑范围。
        </p>
      </section>


      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#2670ac" }}>
            技术经历
        </h2>
        <img src="/profile/image.png" alt="技术经历" />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#2670ac" }}>
          社区账号
        </h2>
        <div className="text-zinc-700 space-y-2">
            <span className="mr-4">GitHub: <a href="https://github.com/fxxjdedd" className="text-blue-600 hover:underline">fxxjdedd</a></span>
            <span className="mr-4">知乎: <a href="https://www.zhihu.com/people/da-da-92-27" className="text-blue-600 hover:underline">达达XxjzZ</a></span>
            <span className="mr-4">掘金（早期文章）: <a href="https://juejin.cn/user/4019470240849966/posts" className="text-blue-600 hover:underline">XxjzZ</a></span>
            <p>作品链接：<a href="https://pa7tm5fud59.feishu.cn/docx/IAi1dHHXioDg4fxLgCvcOsYjnYg" className="text-blue-600 hover:underline">Skyler's Profile</a></p>
            <p>side-projects：


            <ul className="list-disc ml-6 text-zinc-700 space-y-2">
                <li>
                    <a href="https://github.com/fxxjdedd/simple-webgl-renderer" className="text-blue-600 hover:underline">simple-webgl-renderer</a>
                    {" "}- 一个简单的WebGL2.0的渲染器，支持SSAO/GTAO后处理效果，支持PBR渲染管线，支持.obj模型数据导入，持续更新中。
                </li>
                <li>
                    <a href="https://github.com/fxxjdedd/simple-map" className="text-blue-600 hover:underline">simple-map</a>
                    {" "}- 一个简单的Web地图，支持最简单的卫星地图加载。
                </li>
                <li>
                    <a href="https://github.com/fxxjdedd/creative-experiments" className="text-blue-600 hover:underline">creative-experiments</a>
                    {" "}- 一些有意思的图形渲染实验，主要是学习和分享目的，持续更新中。
                </li>
            </ul>
            </p>
        </div>
      </section>



      {/* 工作经历 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#2670ac" }}>
          工作经历
        </h2>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">三维渲染工程师 - 海尔优家（北京）</h3>
              <span className="text-zinc-600">11/2023 - Present</span>
            </div>
            <h4 className="font-semibold mb-2">3D模型全链路自动化处理流水线:</h4>
            <ul className="list-disc ml-6 text-zinc-700 space-y-2">
              <li>
                <strong>概览：</strong>设计并实现了三翼鸟定制平台3D模型全链路自动处理流水线，将模型从母库转换到移动端glTF模型的成功率从30%提升到80%，大幅扩充了移动端的可用模型数量，解决了toC产品长期受制于模型数量不足而无法对外部用户开放使用的问题。
              </li>
              <li>
                <strong>亮点1[见图1]：</strong>设计并实现了基于深度检测的背面剔除算法，将模型的"安全”减面比例从原本到40~50%大幅提升到80%以上，解决了模型面数过多导致内存占用过大而无法在移动端使用的关键卡点。放眼业界，该算法是首创，已撰写专利。
              </li>
              <li>
                <strong>亮点2：</strong>设计并实现了模型网格和材质合并的自动处理脚本，将模型的运行时DrawCall次数从与模型材质数量线性相关降低到常量，极大提升了模型的运行时渲染性能，解决了模型在移动端渲染帧数过低以及内存溢出的问题。已申请专利。
              </li>
              <li>
                <strong>亮点3：</strong>设计并实现了3dsMax VRay材质转glTF材质的自动处理脚本，将3dsMax中的特有材质效果“无损”、“低损“地转换为移动端可用的glTF材质，解决了长期存在的移动端模型的品质、正确性无法对齐原始模型的问题。
              </li>
              <li>
                <strong>其他：</strong>实现了一套基于node.js的稳定可用的批处理任务系统，支持任务状态记录、日志管理、错误管理等能力；基于OpenCV自动高细节度模型转低细节度模型；
              </li>
              <li>
                <strong>结果和收益：</strong>得益于上述自动化流水线，已完成模型母库70%（3000+个）的模型的批量转换；模型的移动端转换工作从人工处理转变成自动化处理，人工处理成本从单个模型0.5~1人天降低到5分钟左右。
              </li>
              {/* <li>
                参与开发了自研室内设计工具（基于Three.js）的日常迭代，包括墙、地板、天花板的材质铺贴，踢脚线、吊顶的生成，以及家居布局自动吸附等能力。
              </li>
              <li>
                参与开发了AWE展会参展的智慧家居作品（基于Unity），支持家电模型的GUI交互、信息展示、扫地机器人移动动画、镜头漫游等功能，同时配合3dsMax/Blender对gltf/fbx模型进行渲染优化。
              </li>
              <li>
                开发了一个渲染图输出自动化的chrome插件，利用content-script向目标网站注入代码，获取其内部运行的内存对象，从而将需要手工完成的设计工作转变成批处理脚本，极大提升了工作效率。
              </li> */}
            </ul>
            <h4 className="font-semibold mb-2">自研Web端BIM平台（类酷家乐）:</h4>

            <ul className="list-disc ml-6 text-zinc-700 space-y-2">
              <li>
                <strong>概览：</strong>自研BIM是我们的核心能力，不过还处于早期阶段，我参与并贡献了底层的Transaction能力，支持基于备忘录模式的Undo/Redo能力。
              </li>
              <li>
                <strong>亮点1：</strong>设计并实现了BIM软件中的Transaction底层能力，基于数据驱动的思想，将一个Transaction内部的所有数据修改自动记录到内存中，并按需在Undo/Redo动作发生时恢复内存数据。
              </li>
              <li>
                <strong>亮点2：</strong>基于ES6 Proxy设计了一套响应式系统，对于对象属性的直接修改会”无感的“隐式记录下来，无需显式声明数据变更。这个系统还实现了类似immer.js的immutable和局部clone的能力。
              </li>
              <li>
                <strong>亮点3：</strong>借助AI能力生成单元测试，覆盖率80%以上，有效确保迭代过程中的代码稳定性。另外，在组内推广TDD模式，推广AI工具的使用，推广现代化的前端开发模式。
              </li>
              <li>
                <strong>结果和收益：</strong>基于Transaction能力，推动了BIM内核代码的重构工作，内核代码全面转向数据驱动模式，在此基础上向上构建了BIM结构（如墙、门、窗等）、3D结构（材质、Transform等）的Undo/Redo能力。这为后续自研BIM进一步迭代提供了坚实的基础。
              </li> 
            </ul>

            <h4 className="font-semibold mb-2">其他零碎事情:</h4>

            <ul className="list-disc ml-6 text-zinc-700 space-y-2">
              <li>
                Unity项目<strong>[见图2]</strong>：基于AWE展会参展需求，开发了一套基于Unity的虚拟现实室内空间项目，支持在大屏上进行室内漫游。该项目的核心亮点是，结合了预烘焙和实时光照的渲染技术，在保证高帧数运行的同时，实现了接近真实场景的渲染效果。
              </li>
              <li>
                Chrome插件：使用content-script向目标网站注入代码，使用backend-script跨域进行数据传输，替代了之前手工点点点的工作，极大提升了工作效率。
              </li>
              <li>
                各种技术文章、分享：包含渲染方向和前端方向，渲染方向主要是学习和推广技术，包括《全局光照》，《模型减面原理》，《Gamma修正》等，前端方向主要是给组内普及前端知识，包括《JS开发者需要知道的前端背景知识》。
              </li>
            </ul>
          </div>

          {/* 阿里巴巴经历 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">前端工程师（WebGIS和数据平台）- 阿里巴巴 高德地图</h3>
              <span className="text-zinc-600">04/2021 - 08/2023</span>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">前端部分:</h4>
                <ul className="list-disc ml-6 text-zinc-700 space-y-2">
                  <li>
                    参与开发了GIS方向的数据管理平台，技术栈是React+AMap+Node，支持地图上的矢量图形绘制、编辑、交互，MVT格式的瓦片渲染，以及历史记录、数据上传下载、数据服务发布等功能。
                  </li>
                  <li>
                    参与开发了高德地图jsapi渲染能力的组件化，包括基于AMap.js的地图组件库，以及基于Loca.js的地理数据可视化组件库的开发。
                  </li>
                  <li>
                    参与建设了内部低代码平台（基于ali-lowcode-engine），开发了MixedSetter用于解决地图组件运行在低代码平台上所需的复杂属性配置功能。
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">渲染部分:</h4>
                <ul className="list-disc ml-6 text-zinc-700 space-y-2">
                  <li>
                    参与了AMap.js/Loca.js地图渲染能力的迭代工作，贡献了Shader多光源、数据源增量构建、文字标注、Editor使用体验升级、地图在线配置插件等能力。
                  </li>
                  <li>
                    参与了两届《十一出行节》数据可视化大屏的开发工作，实现了多种渲染效果，包括多光源布景、光源动画、图层动画，解决了很多运行时性能和渲染性能上的问题。
                  </li>
                  <li>
                    参与了高德产业版地理信息引擎（基于Unity
                    WebGL）的开发工作<strong>[见图3]</strong>，主导了私有数据协议规范的制定、基于私有数据协议的生产服务和瓦片访问服务，基于私有数据协议的渲染SDK等开发工作。其中，由于该引擎是以JS-SDK的形式存在，还设计并实现了一套JS
                    bridge，实现了JS端到C#端的无差内存访问互相调用。
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">前端工程师 - 小米、美团</h3>
              <span className="text-zinc-600">小米 06/2018 - 04/2020 | 美团 04/2020 - 04/2021</span>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">合并到一起:</h4>
                <ul className="list-disc ml-6 text-zinc-700 space-y-2">
                  <li>
                    在小米实习阶段做Java后端开发和Hadoop大数据开发，所以我对服务端、数据库以及前后端如何打交道这件事有更深刻的理解。
                  </li>
                  <li>
                    在小米转正后，我参与了小米大数据部的数据平台（类似神策数据、GrowingIO）的开发工作，负责了数据平台的前端开发，包括数据查询、数据可视化、数据分析等功能。
                  </li>
                  <li>
                    在美团工作的一段时间，基于 code-server 开源项目把vscode部署到了web端，给数据工程师写代码、编排流水线使用；另外，做了大量的前端分享。
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#2670ac" }}>
            教育背景
        </h2>
        <strong>山东财经大学</strong>，信息管理与信息系统专业，本科，于 2014-2018 期间就读于济南。
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#2670ac" }}>
            参考图片
        </h2>
        <p>取自作品集，链接：<a href="https://pa7tm5fud59.feishu.cn/docx/IAi1dHHXioDg4fxLgCvcOsYjnYg" className="text-blue-600 hover:underline">Skyler's Profile</a></p>


        <div className="my-8">
          <h4 className="font-semibold mb-2">图1：3D模型自动化处理管线相关</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col items-center">
              <img 
                src="/profile/backface-cruncher1.png" 
                className="w-[350px] h-[350px] rounded-lg shadow-md object-cover"
              />
              <p className="text-sm text-zinc-600 text-center">
                  背面剔除之前，内部存在大量的模型细节，人工去除非常麻烦
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <img 
                src="/profile/backface-cruncher2.png" 
                className="w-[350px] h-[350px] rounded-lg shadow-md object-cover"
              />
              <p className="text-sm text-zinc-600 text-center">
                  背面提出之后，自动识别并去除所有内部细节
              </p>
            </div>

          </div>
        </div>

        <div className="my-8">
          <h4 className="font-semibold mb-2">图2：AWE参展Unity虚拟室内空间项目</h4>
          <div className="flex flex-col items-center">
            <div className="space-y-2 flex flex-col items-center w-full">
              <img 
                src="/profile/awe.png" 
                className="w-full max-w-[480px] rounded-lg shadow-md object-cover"
              />
              <p className="text-sm text-zinc-600 text-center">
                 可以看做一个游戏，支持鼠标键盘控制任务在场景中移动，观看各种智慧室内场景的效果
              </p>
            </div>
          </div>
        </div>

        <div className="my-8">
          <h4 className="font-semibold mb-2">图3：高德产业版地理信息引擎</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col items-center">
              <img 
                src="/profile/world1.png" 
                className="w-[400px] h-[350px] rounded-lg shadow-md object-cover"
              />
              <p className="text-sm text-zinc-600 text-center">
                球体投影的矢量瓦片地球，可以无限下钻
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <img 
                src="/profile/world2.png" 
                className="w-[350px] h-[350px] rounded-lg shadow-md object-cover"
              />
              <p className="text-sm text-zinc-600 text-center">
                下钻到目标位置后，展示3D瓦片数据
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 打印样式 */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
