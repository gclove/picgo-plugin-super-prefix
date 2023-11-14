import { PicGo } from 'picgo'
import dayjs from 'dayjs'

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

async function beforeUploadHandle (ctx) {
  const autoRename = ctx.getConfig('settings.autoRename');
  if (autoRename) {
    ctx.emit('notification', {
      title: '❌ 警告',
      body: '请关闭 PicGo 的 &#8203;``【oaicite:0】``&#8203; 功能,\nsuper-prefix 插件重命名方式会被覆盖',
    });
    await sleep(10000);
    throw new Error('super-prefix conflict');
  }

  let userConfig = ctx.getConfig('picgo-plugin-super-prefix');
  if (!userConfig) {
    userConfig = {
      prefix: '',
      fileFormat: '',
    };
  }

  for (let i = 0; i < ctx.output.length; i++) {
    let fileName = ctx.output[i].fileName;
    let prefix = '';
    if (userConfig.prefixFormat !== undefined && userConfig.prefixFormat !== '') {
      prefix = dayjs().format(userConfig.prefixFormat);
    }

    if (userConfig.fileFormat !== undefined && userConfig.fileFormat !== '') {
      if (i > 0) {
        fileName = prefix + dayjs().format(userConfig.fileFormat) + '-' + i + ctx.output[i].extname;
      } else {
        fileName = prefix + dayjs().format(userConfig.fileFormat) + ctx.output[i].extname;
      }
    } else {
      fileName = prefix + fileName;
    }

    ctx.output[i].fileName = fileName;
  }
}

async function afterUploadHandle (ctx) {
  const autoRename = ctx.getConfig('settings.autoRename');
  if (autoRename) {
    ctx.emit('notification', {
      title: '❌ 警告',
      body: '请关闭 PicGo 的 &#8203;``【oaicite:0】``&#8203; 功能,\nsuper-prefix 插件重命名方式会被覆盖',
    });
    await sleep(10000);
    throw new Error('super-prefix conflict');
  }

  let userConfig = ctx.getConfig('picgo-plugin-super-prefix');
  if (!userConfig) {
    userConfig = {
      prefix: '',
      fileFormat: '',
    };
  }

  for (let i = 0; i < ctx.output.length; i++) {
    let url = ctx.output[i].imgUrl;
    let tmpArray = url.split("/");

    if (tmpArray.length <= 0)
      continue;

    let fileName = tmpArray[tmpArray.length - 1];
    let prefix = "";
    if (userConfig.prefixFormat !== undefined && userConfig.prefixFormat !== '') {
      prefix = dayjs().format(userConfig.prefixFormat);
    }

    fileName = prefix + fileName;
    tmpArray[tmpArray.length - 1] = fileName;
    url = tmpArray.join("/");

    ctx.output[i].imgUrl = url;
  }
}

const pluginConfig = ctx => {
  let userConfig = ctx.getConfig('picgo-plugin-super-prefix')
  if (!userConfig) {
    userConfig = {}
  }
  return [
    {
      name: 'prefixFormat',
      type: 'input',
      alias: '文件名个性前缀格式(以/结尾)',
      default: userConfig.prefixFormat || '',
      message: '例如 YYYY/MM/DD/',
      required: false
    },
    {
      name: 'fileFormat',
      type: 'input',
      alias: '文件名个性格式',
      default: userConfig.fileFormat || '',
      message: '例如 YYYYMMDDHHmmss',
      required: false
    }
  ]
}

export = (ctx: PicGo) => {
  const register = (): void => {
    ctx.helper.beforeUploadPlugins.register('super-prefix', {
      handle: beforeUploadHandle, 
      config: pluginConfig
    })
    ctx.helper.afterUploadPlugins.register('super-prefix', {
      handle: afterUploadHandle,
      config: pluginConfig
    })
  }
  return {
    register,
    config: pluginConfig
  }
}
